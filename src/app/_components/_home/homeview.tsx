'use client';

import React from "react";
import { useSession } from "next-auth/react";
import PendingCard from "./pendingCard";
import TotalCard from "./totalCard";
import ApprovedCard from "./approvedCard";
import RejectedCard from "./rejectedCard";
import ShortcutApprovingCard from "./shortcutApproving";
import PieChartIncidences from "./dataCard";

export default function Dashboard() {
  const { data: session } = useSession();
  const apiEndpoint = "/api/registroIncidencia";

  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 py-8">
      <div className="w-full max-w-7xl px-6 space-y-8">
        {/* Primera fila de métricas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <PendingCard apiEndpoint={apiEndpoint} session={session} />
          <TotalCard apiEndpoint={apiEndpoint} session={session}/>
          <ApprovedCard apiEndpoint={apiEndpoint} session={session}/>
          <RejectedCard apiEndpoint={apiEndpoint} session={session}/>
        </div>

        {/* Segunda fila */}
        <div className="flex gap-6">
          {/* ShortcutApprovingCard ocupa el 70% del ancho */}
          <div className="flex-[7]">
            <ShortcutApprovingCard apiEndpoint={apiEndpoint} />
          </div>

          {/* PieChartIncidences ocupa el 30% del ancho */}
          <div className="flex-[3] h-full">
            <PieChartIncidences apiEndpoint={apiEndpoint} />
          </div>
        </div>
      </div>
    </div>
  );
}
