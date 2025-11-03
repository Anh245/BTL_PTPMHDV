import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Train, 
  MapPin, 
  Clock, 
  Users, 
  Settings, 
  Bell,
  Shield,
  Mail,
  Phone,
  Calendar,
  TrendingUp,
  AlertCircle,
  CheckCircle
} from "lucide-react";

export default function App() {
  const userProfile = {
    name: "Sarah Johnson",
    role: "Station Manager",
    email: "sarah.johnson@trainstation.com",
    phone: "+1 (555) 123-4567",
    joinDate: "January 2022",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop",
  };

  const assignedStations = [
    { name: "Central Station", location: "Downtown", status: "active", trains: 45 },
    { name: "North Terminal", location: "North District", status: "active", trains: 32 },
    { name: "East Junction", location: "East Quarter", status: "maintenance", trains: 18 },
  ];

  const recentActivity = [
    { action: "Updated schedule", station: "Central Station", time: "2 hours ago", type: "success" },
    { action: "Maintenance alert", station: "East Junction", time: "5 hours ago", type: "warning" },
    { action: "Staff meeting", station: "North Terminal", time: "1 day ago", type: "info" },
    { action: "Safety inspection completed", station: "Central Station", time: "2 days ago", type: "success" },
  ];

  const stats = [
    { label: "Total Stations", value: "3", icon: MapPin },
    { label: "Active Trains", value: "95", icon: Train },
    { label: "Staff Members", value: "127", icon: Users },
    { label: "Avg. On-Time", value: "94%", icon: Clock },
  ];

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-7xl">
        {/* Header */}
        <header className="bg-white border-b border-slate-200 rounded-t-lg">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Train className="w-8 h-8 text-blue-600" />
                <h1 className="text-xl font-bold text-black">Station Management System</h1>
              </div>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </header>

        <div className="px-4 sm:px-6 lg:px-8 py-8 bg-white rounded-b-lg">
          {/* Profile Header */}
          <Card className="mb-8 shadow-none border-0">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
                <Avatar className="w-24 h-24">
                  <AvatarImage src={userProfile.avatar} alt={userProfile.name} />
                  <AvatarFallback>SJ</AvatarFallback>
                </Avatar>
                
                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="text-slate-900 mb-1">{userProfile.name}</h2>
                      <p className="text-slate-600 mb-3">{userProfile.role}</p>
                      <div className="flex flex-wrap gap-4 text-slate-600">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          <span className="text-sm">{userProfile.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4" />
                          <span className="text-sm">{userProfile.phone}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">Joined {userProfile.joinDate}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button>Edit Profile</Button>
                      <Button variant="outline">
                        <Bell className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {stats.map((stat, index) => (
                <Card key={index}>
                  <CardContent className="pt-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-slate-600 text-sm mb-1">{stat.label}</p>
                        <p className="text-slate-900">{stat.value}</p>
                      </div>
                      <div className="bg-blue-100 p-3 rounded-lg">
                        <stat.icon className="w-6 h-6 text-blue-600" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Main Content Tabs */}
            <Tabs defaultValue="stations" className="space-y-4">
              <TabsList>
                <TabsTrigger value="stations">Assigned Stations</TabsTrigger>
                <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                <TabsTrigger value="preferences">Preferences</TabsTrigger>
              </TabsList>

              <TabsContent value="stations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Your Stations</CardTitle>
                    <CardDescription>
                      Stations under your management
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {assignedStations.map((station, index) => (
                        <div key={index}>
                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <div className="flex items-start gap-4">
                              <div className="bg-slate-100 p-3 rounded-lg">
                                <MapPin className="w-6 h-6 text-slate-700" />
                              </div>
                              <div>
                                <h3 className="text-slate-900 mb-1">{station.name}</h3>
                                <p className="text-slate-600 text-sm mb-2">{station.location}</p>
                                <div className="flex items-center gap-2">
                                  <Badge variant={station.status === "active" ? "default" : "secondary"}>
                                    {station.status}
                                  </Badge>
                                  <span className="text-slate-600 text-sm flex items-center gap-1">
                                    <Train className="w-3 h-3" />
                                    {station.trains} trains/day
                                  </span>
                                </div>
                              </div>
                            </div>
                            <Button variant="outline" size="sm">View Details</Button>
                          </div>
                          {index < assignedStations.length - 1 && <Separator className="mt-4" />}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="activity" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                    <CardDescription>
                      Your recent actions and updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recentActivity.map((activity, index) => (
                        <div key={index}>
                          <div className="flex items-start gap-4">
                            <div className={`p-2 rounded-full ${
                              activity.type === "success" ? "bg-green-100" :
                              activity.type === "warning" ? "bg-orange-100" :
                              "bg-blue-100"
                            }`}>
                              {activity.type === "success" ? (
                                <CheckCircle className={`w-4 h-4 ${
                                  activity.type === "success" ? "text-green-600" :
                                  activity.type === "warning" ? "text-orange-600" :
                                  "text-blue-600"
                                }`} />
                              ) : activity.type === "warning" ? (
                                <AlertCircle className="w-4 h-4 text-orange-600" />
                              ) : (
                                <TrendingUp className="w-4 h-4 text-blue-600" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-slate-900">{activity.action}</p>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <span className="text-slate-600 text-sm">{activity.station}</span>
                                <span className="text-slate-400 text-sm">•</span>
                                <span className="text-slate-500 text-sm">{activity.time}</span>
                              </div>
                            </div>
                          </div>
                          {index < recentActivity.length - 1 && <Separator className="mt-4" />}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="preferences" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Preferences</CardTitle>
                    <CardDescription>
                      Manage how you receive updates
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Email Notifications</Label>
                        <p className="text-sm text-slate-500">Receive updates via email</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Maintenance Alerts</Label>
                        <p className="text-sm text-slate-500">Get notified about station maintenance</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Schedule Changes</Label>
                        <p className="text-sm text-slate-500">Updates about train schedule modifications</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Safety Reports</Label>
                        <p className="text-sm text-slate-500">Critical safety incident notifications</p>
                      </div>
                      <Switch defaultChecked />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Security Settings</CardTitle>
                    <CardDescription>
                      Manage your account security
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label>Two-Factor Authentication</Label>
                        <p className="text-sm text-slate-500">Add an extra layer of security</p>
                      </div>
                      <Switch />
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label>Password</Label>
                        <p className="text-sm text-slate-500">Last changed 3 months ago</p>
                      </div>
                      <Button variant="outline" size="sm">Change Password</Button>
                    </div>
                    <Separator />
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1">
                        <Label className="flex items-center gap-2">
                          <Shield className="w-4 h-4" />
                          Access Level
                        </Label>
                        <p className="text-sm text-slate-500">Station Manager - Full Access</p>
                      </div>
                      <Badge>Verified</Badge>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    );
}
