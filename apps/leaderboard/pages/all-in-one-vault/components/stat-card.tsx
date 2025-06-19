import React from 'react';
import { Card } from '@nextui-org/react';

export default function StatCard() {
  const statsData = [
    {
      label: 'Total Weight',
      value: '30',
    },
    { label: 'LBGT Balance', value: '7.0' },
    { label: 'LBGT Lifetime', value: '10.5' },
  ];
  return (
    <div className="flex flex-col justify-center w-full rounded-2xl gap-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        {statsData.map((stat, index) => (
          <Card
            key={index}
            className="border-2 border-dashed border-black bg-white/90 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.8)]"
          >
            <div className="p-4 text-center">
              <div className="text-sm text-gray-600 mb-1 font-theader">{stat.label}</div>
              <div className="text-2xl font-bold text-gray-800">
                {stat.value}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
