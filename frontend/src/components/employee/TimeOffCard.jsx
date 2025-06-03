import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Clock } from 'lucide-react';

const TimeOffCard = () => {
  // Fake data for now
  const timeOffData = {
    vacation: {
      available: 29.6,
      scheduled: "48 hours scheduled",
    },
    sick: {
      available: 24,
      scheduled: "8 hours scheduled",
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Time Off
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Vacation */}
          <div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary">{timeOffData.vacation.available}</span>
              <span className="text-sm text-muted-foreground">hours available</span>
              <span className="text-sm text-muted-foreground">{timeOffData.vacation.scheduled}</span>
            </div>
            <div className="text-sm font-medium mt-2">Vacation</div>
          </div>

          {/* Sick Leave */}
          <div>
            <div className="flex flex-col">
              <span className="text-3xl font-bold text-primary">{timeOffData.sick.available}</span>
              <span className="text-sm text-muted-foreground">hours available</span>
              <span className="text-sm text-muted-foreground">{timeOffData.sick.scheduled}</span>
            </div>
            <div className="text-sm font-medium mt-2">Sick</div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button className="w-full" variant="outline">
              Request Time Off
            </Button>
            <Button variant="outline" size="icon">
              <Clock className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeOffCard; 