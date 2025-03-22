import React from 'react';

const SummaryCard = ({icon, text, number}) => {
    return (
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6 flex items-center space-x-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                {icon}
            </div>
            <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{text}</p>
                <p className="text-2xl font-bold">{number}</p>
            </div>
        </div>
    );
};

export default SummaryCard; 