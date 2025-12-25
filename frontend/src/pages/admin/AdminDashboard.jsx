import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const areaData = [
    { name: 'Jan', bookings: 40 },
    { name: 'Feb', bookings: 30 },
    { name: 'Mar', bookings: 20 },
    { name: 'Apr', bookings: 27 },
    { name: 'May', bookings: 18 },
    { name: 'Jun', bookings: 23 },
    { name: 'Jul', bookings: 34 },
];

const pieData = [
    { name: 'Meeting Rooms', value: 400 },
    { name: 'Equipment', value: 300 },
    { name: 'Halls', value: 300 },
    { name: 'Others', value: 200 },
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function AdminDashboard() {
    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold tracking-tight">Admin Dashboard</h2>

            {/* Overview Charts */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <Card className="col-span-full lg:col-span-4 min-w-0">
                    <CardHeader>
                        <CardTitle>Booking Trends</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={areaData}>
                                    <defs>
                                        <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <Tooltip />
                                    <Area type="monotone" dataKey="bookings" stroke="#8884d8" fillOpacity={1} fill="url(#colorBookings)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="col-span-full md:col-span-1 lg:col-span-3 min-w-0">
                    <CardHeader>
                        <CardTitle>Resource Utilization</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        fill="#8884d8"
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
