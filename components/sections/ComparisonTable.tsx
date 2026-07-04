import React from "react";
import { PhotographyCategory } from "../../lib/types";

interface ComparisonTableProps {
  category: PhotographyCategory;
}

export default function ComparisonTable({ category }: ComparisonTableProps) {
  const packages = category.pricing || [];
  const rows = ["Session style", "Edited images", "Best for"] as const;

  if (packages.length === 0) return null;

  return (
    <table className="compare">
      <thead>
        <tr>
          <th>Package</th>
          {packages.map((pkg, idx) => (
            <th key={idx}>{pkg.name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, rowIndex) => (
          <tr key={row}>
            <th>{row}</th>
            {packages.map((pkg, idx) => (
              <td key={idx}>
                {pkg.includes[rowIndex] || pkg.includes[pkg.includes.length - 1]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
export { ComparisonTable };
