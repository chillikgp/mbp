import React from "react";
import { AddonDetail } from "../../lib/types";

interface AddonsComparisonTableProps {
  addons: AddonDetail[];
}

export default function AddonsComparisonTable({ addons }: AddonsComparisonTableProps) {
  if (!addons || addons.length === 0) return null;

  return (
    <table className="compare">
      <thead>
        <tr>
          <th>Add-on</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        {addons.map((addon, idx) => (
          <tr key={idx}>
            <th>{addon.name}</th>
            <td>{addon.price}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
export { AddonsComparisonTable };
