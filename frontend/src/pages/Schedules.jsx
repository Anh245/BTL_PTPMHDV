import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import vi from '@/lib/translations';

export default function Schedules() {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">{vi.schedules.title}</h1>
          <p className="mt-1.5 text-slate-600 dark:text-slate-400">
            {vi.schedules.description}
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          {vi.schedules.addSchedule}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            {vi.schedules.management}
          </CardTitle>
          <CardDescription>
            {vi.schedules.comingSoonDesc}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-slate-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-slate-300" />
            <p className="text-lg font-medium">{vi.schedules.featureComingSoon}</p>
            <p className="text-sm mt-2">{vi.schedules.createEditManage}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
