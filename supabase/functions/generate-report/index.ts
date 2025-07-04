import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReportRequest {
  reportType: string;
  dateFrom: string;
  dateTo: string;
  userId: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { reportType, dateFrom, dateTo, userId }: ReportRequest = await req.json();

    console.log("📊 Génération rapport:", { reportType, dateFrom, dateTo, userId });

    // Obtenir l'ID du réparateur depuis l'utilisateur
    const { data: profile } = await supabase
      .from('repairer_profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (!profile) {
      throw new Error("Profil réparateur non trouvé");
    }

    const repairerId = profile.id;

    // 1. Données de ventes
    const { data: transactions } = await supabase
      .from('pos_transactions')
      .select('*')
      .eq('repairer_id', repairerId)
      .gte('transaction_date', dateFrom)
      .lte('transaction_date', dateTo);

    const { data: orders } = await supabase
      .from('ecommerce_orders')
      .select('*')
      .eq('repairer_id', repairerId)
      .gte('created_at', dateFrom)
      .lte('created_at', dateTo);

    // 2. Données d'inventaire
    const { data: inventory } = await supabase
      .from('pos_inventory')
      .select('*')
      .eq('repairer_id', repairerId);

    const { data: products } = await supabase
      .from('ecommerce_products')
      .select('*')
      .eq('repairer_id', repairerId);

    // 3. Données clients (approximation basée sur les transactions)
    const allTransactions = [...(transactions || []), ...(orders || [])];
    const uniqueCustomers = new Set(allTransactions.map(t => t.customer_email || t.customer_id));

    // Calculer les métriques de vente
    const totalSales = allTransactions.reduce((sum, t) => sum + (t.total_amount || t.total), 0);
    const totalTransactions = allTransactions.length;
    const avgTransaction = totalTransactions > 0 ? totalSales / totalTransactions : 0;

    // Calculer la croissance (comparaison avec la période précédente)
    const periodDuration = new Date(dateTo).getTime() - new Date(dateFrom).getTime();
    const previousDateFrom = new Date(new Date(dateFrom).getTime() - periodDuration).toISOString();
    const previousDateTo = dateFrom;

    const { data: previousTransactions } = await supabase
      .from('pos_transactions')
      .select('total_amount')
      .eq('repairer_id', repairerId)
      .gte('transaction_date', previousDateFrom)
      .lte('transaction_date', previousDateTo);

    const { data: previousOrders } = await supabase
      .from('ecommerce_orders')
      .select('total')
      .eq('repairer_id', repairerId)
      .gte('created_at', previousDateFrom)
      .lte('created_at', previousDateTo);

    const previousTotal = [
      ...(previousTransactions || []),
      ...(previousOrders || [])
    ].reduce((sum, t) => sum + (t.total_amount || t.total), 0);

    const growth = previousTotal > 0 ? ((totalSales - previousTotal) / previousTotal) * 100 : 0;

    // Analyser les produits les plus vendus
    const productSales: Record<string, { quantity: number; revenue: number }> = {};
    
    allTransactions.forEach(transaction => {
      if (transaction.items) {
        transaction.items.forEach((item: any) => {
          if (!productSales[item.name]) {
            productSales[item.name] = { quantity: 0, revenue: 0 };
          }
          productSales[item.name].quantity += item.quantity;
          productSales[item.name].revenue += item.price * item.quantity;
        });
      }
    });

    const topSelling = Object.entries(productSales)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.revenue - a.revenue);

    // Détecter les stocks faibles
    const allInventory = [...(inventory || []), ...(products || [])];
    const lowStock = allInventory.filter(item => 
      item.stock_quantity <= (item.min_stock_level || 5)
    ).map(item => ({
      name: item.name || item.title,
      stock: item.stock_quantity,
      minStock: item.min_stock_level || 5
    }));

    // Ventes quotidiennes
    const dailySales: Record<string, number> = {};
    allTransactions.forEach(transaction => {
      const date = new Date(transaction.transaction_date || transaction.created_at).toISOString().split('T')[0];
      dailySales[date] = (dailySales[date] || 0) + (transaction.total_amount || transaction.total);
    });

    const dailySalesArray = Object.entries(dailySales)
      .map(([date, amount]) => ({ date, amount }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Répartition par catégorie
    const categoryBreakdown: Record<string, number> = {};
    allTransactions.forEach(transaction => {
      if (transaction.items) {
        transaction.items.forEach((item: any) => {
          const category = item.category || 'Autre';
          categoryBreakdown[category] = (categoryBreakdown[category] || 0) + (item.price * item.quantity);
        });
      }
    });

    const categoryArray = Object.entries(categoryBreakdown)
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalSales > 0 ? Math.round((amount / totalSales) * 100) : 0
      }))
      .sort((a, b) => b.amount - a.amount);

    const reportData = {
      sales: {
        total: Math.round(totalSales * 100) / 100,
        transactions: totalTransactions,
        avgTransaction: Math.round(avgTransaction * 100) / 100,
        growth: Math.round(growth * 10) / 10
      },
      products: {
        topSelling: topSelling.slice(0, 20),
        lowStock
      },
      customers: {
        total: uniqueCustomers.size,
        new: Math.round(uniqueCustomers.size * 0.3), // Estimation
        returning: Math.round(uniqueCustomers.size * 0.7) // Estimation
      },
      analytics: {
        dailySales: dailySalesArray,
        categoryBreakdown: categoryArray
      }
    };

    console.log("✅ Rapport généré:", {
      sales: reportData.sales.total,
      transactions: reportData.sales.transactions,
      products: reportData.products.topSelling.length,
      customers: reportData.customers.total
    });

    return new Response(JSON.stringify(reportData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Erreur génération rapport:", error);
    
    return new Response(JSON.stringify({
      error: error.message
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});