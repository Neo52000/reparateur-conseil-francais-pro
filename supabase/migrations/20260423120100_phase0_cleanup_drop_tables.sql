-- ============================================================================
-- Phase 0 — Suppression des tables des modules hors scope
-- ============================================================================
-- Objectif : supprimer les tables SQL correspondant aux modules retirés du code
-- (devis transactionnel, factures, POS+NF525, NF203, ecommerce, stocks, parts,
-- marketplace, SAV, dispute, pricing grid).
--
-- Stratégie : DROP TABLE IF EXISTS ... CASCADE (supprime aussi les FK des tables
-- dépendantes, les vues et les triggers rattachés).
--
-- Ordre : de la feuille vers la racine (FK-safe même sans CASCADE).
-- ============================================================================

BEGIN;

-- ----------------------------------------------------------------------------
-- Devis transactionnel (A1) + admin quotes
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS public.admin_quote_assignments       CASCADE;
DROP TABLE IF EXISTS public.appointments_with_quotes      CASCADE;
DROP TABLE IF EXISTS public.quotes_with_timeline          CASCADE;
DROP TABLE IF EXISTS public.ai_quote_analyses             CASCADE;
DROP TABLE IF EXISTS public.ai_quote_templates            CASCADE;
DROP TABLE IF EXISTS public.quote_messages                CASCADE;
DROP TABLE IF EXISTS public.quote_requests                CASCADE;
DROP TABLE IF EXISTS public.quotes                        CASCADE;
DROP TABLE IF EXISTS public.pricing_grid                  CASCADE; -- B4

-- ----------------------------------------------------------------------------
-- Factures conso (A2) + NF203 (A4)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS public.electronic_invoices_chain     CASCADE;
DROP TABLE IF EXISTS public.electronic_invoices           CASCADE;
DROP TABLE IF EXISTS public.invoice_items                 CASCADE;
DROP TABLE IF EXISTS public.invoices                      CASCADE;

-- ----------------------------------------------------------------------------
-- POS + NF525 (A3)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS public.irreparability_nf525_archive  CASCADE;
DROP TABLE IF EXISTS public.nf525_archive_stats           CASCADE;
DROP TABLE IF EXISTS public.nf525_archive_logs            CASCADE;
DROP TABLE IF EXISTS public.nf525_receipt_archives        CASCADE;
DROP TABLE IF EXISTS public.pos_analytics_cache           CASCADE;
DROP TABLE IF EXISTS public.pos_catalog_sync              CASCADE;
DROP TABLE IF EXISTS public.pos_hardware_config           CASCADE;
DROP TABLE IF EXISTS public.pos_hardware_status           CASCADE;
DROP TABLE IF EXISTS public.pos_offline_operations        CASCADE;
DROP TABLE IF EXISTS public.pos_staff_assignments         CASCADE;
DROP TABLE IF EXISTS public.pos_staff_roles               CASCADE;
DROP TABLE IF EXISTS public.pos_payment_methods           CASCADE;
DROP TABLE IF EXISTS public.pos_customers                 CASCADE;
DROP TABLE IF EXISTS public.pos_inventory_items           CASCADE;
DROP TABLE IF EXISTS public.pos_transaction_items         CASCADE;
DROP TABLE IF EXISTS public.pos_transactions              CASCADE;
DROP TABLE IF EXISTS public.pos_receipts                  CASCADE;
DROP TABLE IF EXISTS public.pos_sessions                  CASCADE;
DROP TABLE IF EXISTS public.pos_systems                   CASCADE;
DROP TABLE IF EXISTS public.global_pos_settings           CASCADE;

-- ----------------------------------------------------------------------------
-- Ecommerce + stocks + parts + B1 (repair_orders) + B2 (parts_*)
-- ----------------------------------------------------------------------------
DROP TABLE IF EXISTS public.ecommerce_analytics           CASCADE;
DROP TABLE IF EXISTS public.ecommerce_integrations        CASCADE;
DROP TABLE IF EXISTS public.ecommerce_store_config        CASCADE;
DROP TABLE IF EXISTS public.ecommerce_settings            CASCADE;
DROP TABLE IF EXISTS public.ecommerce_templates           CASCADE;
DROP TABLE IF EXISTS public.ecommerce_stores              CASCADE;
DROP TABLE IF EXISTS public.ecommerce_order_items         CASCADE;
DROP TABLE IF EXISTS public.ecommerce_orders              CASCADE;
DROP TABLE IF EXISTS public.ecommerce_products            CASCADE;
DROP TABLE IF EXISTS public.ecommerce_customers           CASCADE;
DROP TABLE IF EXISTS public.global_ecommerce_settings     CASCADE;

DROP TABLE IF EXISTS public.purchase_order_items          CASCADE;
DROP TABLE IF EXISTS public.purchase_orders               CASCADE;
DROP TABLE IF EXISTS public.stock_alerts                  CASCADE;
DROP TABLE IF EXISTS public.stock_movements               CASCADE;
DROP TABLE IF EXISTS public.repair_parts_used             CASCADE; -- B1
DROP TABLE IF EXISTS public.repair_orders                 CASCADE; -- B1
DROP TABLE IF EXISTS public.parts_orders                  CASCADE; -- B2
DROP TABLE IF EXISTS public.parts_inventory               CASCADE; -- B2
DROP TABLE IF EXISTS public.parts_catalog                 CASCADE; -- B2
DROP TABLE IF EXISTS public.parts_suppliers               CASCADE; -- B2
DROP TABLE IF EXISTS public.spare_parts                   CASCADE; -- B2
DROP TABLE IF EXISTS public.loyalty_transactions          CASCADE;

COMMIT;

-- ============================================================================
-- Rollback :
-- Impossible à rollback automatiquement (data perdue). Les migrations historiques
-- originales qui créent ces tables restent dans supabase/migrations/_archive/
-- (cf. phase0_squash_baseline). Rollback manuel = rejouer la migration d'origine
-- puis restaurer les données depuis pre_squash_backup_2026-04-23.sql.
-- ============================================================================
