'use client';

import { TrendingUp } from 'lucide-react';
import { LabelList, RadialBar, RadialBarChart } from 'recharts';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/app/(frontend)/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/app/(frontend)/components/ui/chart';

export const description = 'A radial chart with a label';

const chartData = [
  { month: 'April', revenue: 80, fill: '#BFDBFE' },
  { month: 'May', revenue: 140, fill: '#93C5FD' },
  { month: 'June', revenue: 200, fill: '#60A5FA' },
  { month: 'July', revenue: 120, fill: '#3B82F6' },
  { month: 'August', revenue: 150, fill: '#1E40AF' },
];

const chartConfig = {
  revenue: {
    label: 'Revenue ($K)',
  },
  April: {
    label: 'April',
    color: '#BFDBFE',
  },
  May: {
    label: 'May',
    color: '#93C5FD',
  },
  June: {
    label: 'June',
    color: '#60A5FA',
  },
  July: {
    label: 'July',
    color: '#3B82F6',
  },
  August: {
    label: 'August',
    color: '#1E40AF',
  },
} satisfies ChartConfig;

export default function DemoDiagramPage() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Monthly Revenue Growth</CardTitle>
        <CardDescription>April - August 2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <RadialBarChart
            data={chartData}
            startAngle={-90}
            endAngle={380}
            innerRadius={30}
            outerRadius={110}
          >
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel nameKey="month" />}
            />
            <RadialBar dataKey="revenue" background>
              <LabelList
                position="insideStart"
                dataKey="month"
                className="fill-white capitalize mix-blend-luminosity"
                fontSize={11}
              />
            </RadialBar>
          </RadialBarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm">
        <div className="flex items-center gap-2 leading-none font-medium">
          Revenue up 25% vs last month <TrendingUp className="h-4 w-4" />
        </div>
        <div className="text-muted-foreground leading-none">
          Up 20% this quarter • Peak was in June at $200K
        </div>
      </CardFooter>
    </Card>
  );
}
