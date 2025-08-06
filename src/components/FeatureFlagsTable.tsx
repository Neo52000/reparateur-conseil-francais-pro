
import React from "react";
import { Switch } from "@/components/ui/switch";
import { Table, TableHeader, TableHead, TableBody, TableRow, TableCell } from "@/components/ui/table";
import { FeatureFlagsTableProps } from "@/types/featureFlags";

/**
 * Composant table pour afficher et gérer les fonctionnalités d'une catégorie
 * Permet d'activer/désactiver chaque fonctionnalité pour chaque plan
 */
export const FeatureFlagsTable: React.FC<FeatureFlagsTableProps> = ({
  category,
  features,
  plans,
  getFlag,
  onToggleFlag
}) => {
  return (
    <div>
      <h3 className="text-lg font-semibold mb-4 text-gray-800 border-b pb-2">
        {category} ({features.length})
      </h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/2">Fonctionnalité</TableHead>
            {plans.map(plan => (
              <TableHead key={plan} className="text-center min-w-[100px]">
                {plan}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {features.map(feature => (
            <TableRow key={feature.key}>
              <TableCell className="font-medium">
                {feature.name}
              </TableCell>
              {plans.map(plan => {
                const flag = getFlag(plan, feature.key);
                return (
                  <TableCell className="text-center" key={plan}>
                    <Switch
                      checked={flag?.enabled || false}
                      onCheckedChange={(enabled) => 
                        onToggleFlag(plan, feature.key, enabled)
                      }
                      aria-label={`${feature.name} pour le plan ${plan}`}
                    />
                  </TableCell>
                );
              })}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
