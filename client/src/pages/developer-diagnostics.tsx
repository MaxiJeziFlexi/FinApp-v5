import React from 'react';
import { DiagnosticsPanel } from '@/components/admin/DiagnosticsPanel';

export default function DeveloperDiagnostics() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container mx-auto py-8 px-4">
        <DiagnosticsPanel />
      </div>
    </div>
  );
}