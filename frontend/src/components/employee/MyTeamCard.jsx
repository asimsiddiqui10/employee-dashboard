import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Umbrella, Bed } from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const MyTeamCard = () => {
  // Fake team data with initials and positions
  const teamMembers = [
    {
      id: 1,
      name: "Maja Andev",
      initials: "MA",
      position: "Senior Developer",
      status: {
        type: "vacation",
        message: "Out Today – Oct 31",
        icon: <Umbrella className="h-4 w-4 text-muted-foreground" />
      }
    },
    {
      id: 2,
      name: "Eric Asture",
      initials: "EA",
      position: "Product Manager",
      status: {
        type: "vacation",
        message: "Out Nov 13 – 14",
        icon: <Umbrella className="h-4 w-4 text-muted-foreground" />
      }
    },
    {
      id: 3,
      name: "Cheryl Barnet",
      initials: "CB",
      position: "UX Designer",
      status: {
        type: "vacation",
        message: "Out Nov 14 – 15",
        icon: <Umbrella className="h-4 w-4 text-muted-foreground" />
      }
    },
    {
      id: 4,
      name: "Jake Bryan",
      initials: "JB",
      position: "Frontend Developer",
      status: {
        type: "sick",
        message: "Out Nov 1 – 2",
        icon: <Bed className="h-4 w-4 text-muted-foreground" />
      }
    }
  ];

  return (
    <Card className="col-span-full">
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold flex items-center gap-2 text-green-700">
          <Users className="h-5 w-5" />
          My Team
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <div key={member.id} className="flex items-center gap-4">
              <Avatar className="h-12 w-12 bg-muted">
                <AvatarFallback className="text-muted-foreground">
                  {member.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{member.name}</p>
                <p className="text-sm text-muted-foreground">{member.position}</p>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  {member.status.icon}
                  <span>{member.status.message}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default MyTeamCard; 