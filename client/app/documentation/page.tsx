import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { InfoIcon, BookOpen, Code, Database, Webhook } from "lucide-react";

export default function DocumentationPage() {
    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="space-y-6">
                {/* Header Section */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight">Documentation</h1>
                    <p className="text-lg text-muted-foreground mt-2">
                        Learn how to integrate and use the Solana Helius Indexer
                    </p>
                </div>

                {/* Quick Start Alert */}
                <Alert className="mb-8">
                    <InfoIcon className="h-4 w-4" />
                    <AlertTitle>Heads up!</AlertTitle>
                    <AlertDescription>
                        New to Solana Helius Indexer? Start with our quick setup guide below.
                    </AlertDescription>
                </Alert>

                {/* Main Content Tabs */}
                <Tabs defaultValue="getting-started" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="getting-started">Getting Started</TabsTrigger>
                        <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
                        <TabsTrigger value="database">Database</TabsTrigger>
                        <TabsTrigger value="api">API Reference</TabsTrigger>
                    </TabsList>

                    <TabsContent value="getting-started">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Getting Started
                                </CardTitle>
                                <CardDescription>
                                    Learn the basics of Solana Helius Indexer and set up your first project
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold">Prerequisites</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>A Helius API key</li>
                                        <li>PostgreSQL database</li>
                                        <li>Google account for authentication</li>
                                    </ul>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold">Quick Start Steps</h3>
                                    <ol className="list-decimal pl-6 space-y-4">
                                        <li className="space-y-1">
                                            <p className="font-medium">Sign in to your account</p>
                                            <p className="text-sm text-muted-foreground">
                                                Use Google authentication to create or access your account
                                            </p>
                                        </li>
                                        <li className="space-y-1">
                                            <p className="font-medium">Configure Database</p>
                                            <p className="text-sm text-muted-foreground">
                                                Set up your PostgreSQL connection in the dashboard
                                            </p>
                                        </li>
                                        <li className="space-y-1">
                                            <p className="font-medium">Create Webhook</p>
                                            <p className="text-sm text-muted-foreground">
                                                Configure your first webhook to start indexing data
                                            </p>
                                        </li>
                                    </ol>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="webhooks">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Webhook className="h-5 w-5" />
                                    Webhook Configuration
                                </CardTitle>
                                <CardDescription>
                                    Learn how to set up and manage webhooks
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold">Available Webhook Types</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Transaction Webhooks</li>
                                        <li>NFT Webhooks</li>
                                        <li>Token Webhooks</li>
                                        <li>Custom Program Webhooks</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="database">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Database className="h-5 w-5" />
                                    Database Setup
                                </CardTitle>
                                <CardDescription>
                                    Database configuration and management
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold">Supported Databases</h3>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>PostgreSQL</li>
                                        <li>More coming soon...</li>
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="api">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Code className="h-5 w-5" />
                                    API Reference
                                </CardTitle>
                                <CardDescription>
                                    Complete API documentation and examples
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <h3 className="text-xl font-semibold">Available Endpoints</h3>
                                    <div className="space-y-4">
                                        <div className="p-4 border rounded-lg">
                                            <p className="font-mono text-sm">GET /api/webhooks</p>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                List all webhooks for the authenticated user
                                            </p>
                                        </div>
                                        <div className="p-4 border rounded-lg">
                                            <p className="font-mono text-sm">POST /api/webhooks</p>
                                            <p className="text-sm text-muted-foreground mt-2">
                                                Create a new webhook configuration
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Help Section */}
                <Card className="mt-8">
                    <CardHeader>
                        <CardTitle>Need Help?</CardTitle>
                        <CardDescription>
                            Get support from our community and team
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex text-center ">
                            <a
                                href="https://github.com/thisissamridh/SolanaIndex/issues"
                                className="flex-1 p-4 border rounded-lg hover:bg-accent transition-colors"
                            >
                                <h3 className="font-semibold">GitHub Issues</h3>
                                <p className="text-sm text-muted-foreground">
                                    Report bugs or request features
                                </p>
                            </a>

                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}