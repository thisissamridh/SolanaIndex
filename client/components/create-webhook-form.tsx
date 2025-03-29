"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { getUserDatabases, addWebhook } from "@/lib/firestore"
import { Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
// import { Checkbox } from "@/components/ui/checkbox"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Card,
    CardContent,
    // CardDescription,
    // CardFooter,
    // CardHeader,
    // CardTitle,
} from "@/components/ui/card"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

// Available indexing types
const INDEXER_TYPES = [
    {
        id: "program_invocation",
        name: "Program Invocation Tracking",
        description: "Track when specific Solana programs are invoked in transactions"
    },
    {
        id: "nft_bids",
        name: "NFT Bids",
        description: "Track current bids on NFTs",
        comingSoon: true
    },
    {
        id: "nft_prices",
        name: "NFT Prices",
        description: "Track current prices of NFTs",
        comingSoon: true
    },
    {
        id: "token_borrow",
        name: "Token Borrow Availability",
        description: "Track available tokens to borrow",
        comingSoon: true
    },
    {
        id: "token_prices",
        name: "Token Prices",
        description: "Track token prices across platforms",
        comingSoon: true
    }
]

interface CreateWebhookFormProps {
    onSuccess?: () => void;
}

export function CreateWebhookForm({ onSuccess }: CreateWebhookFormProps) {
    const { user } = useAuth();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [databases, setDatabases] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedIndexerType, setSelectedIndexerType] = useState("program_invocation");
    const [progressStatus, setProgressStatus] = useState("");

    // Form data
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        databaseId: "",
        tableName: "",
        programIds: "",
        accountAddresses: "",
    });

    // Fetch available databases for the current user
    useEffect(() => {
        const fetchDatabases = async () => {
            if (!user) return;

            try {
                const userDatabases = await getUserDatabases(user.uid);
                setDatabases(userDatabases);
            } catch (err) {
                console.error("Error fetching databases:", err);
                setError("Failed to load your databases. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        fetchDatabases();
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSelectChange = (id: string, value: string) => {
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const registerHeliusWebhook = async (webhookId: string, programIds: string[], accountAddresses: string[]) => {
        setProgressStatus("Registering webhook with Helius...");

        try {
            // Call our backend endpoint to register with Helius
            const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3001";
            const response = await fetch(`${backendUrl}/register-helius-webhook`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    webhookId,
                    "transactionTypes": [
                        "ANY"
                    ],
                    programIds,
                    accountAddresses
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Failed to register webhook with Helius");
            }

            const data = await response.json();
            console.log("Helius webhook registered:", data);
            return data;
        } catch (error) {
            console.error("Error registering Helius webhook:", error);
            throw error;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setError("You must be logged in to create a webhook");
            return;
        }

        if (!formData.databaseId) {
            setError("Please select a database");
            return;
        }

        if (selectedIndexerType === "program_invocation" && !formData.programIds) {
            setError("Please enter at least one program ID to track");
            return;
        }

        setIsSubmitting(true);
        setError("");
        setSuccess("");
        setProgressStatus("Creating webhook configuration...");

        try {
            // Convert textarea inputs to arrays
            const programIdsArray = formData.programIds
                .split('\n')
                .map(id => id.trim())
                .filter(id => id);

            const accountAddressesArray = formData.accountAddresses
                .split('\n')
                .map(addr => addr.trim())
                .filter(addr => addr);

            // Find the selected database details
            const selectedDatabase = databases.find(db => db.id === formData.databaseId);

            // Prepare webhook data
            const webhookData = {
                name: formData.name,
                description: formData.description,
                databaseId: formData.databaseId,
                databaseName: selectedDatabase?.name || "",
                webhookType: selectedIndexerType,
                tableName: formData.tableName || "solana_program_invocations", // Default table name
                programIds: programIdsArray,
                accountAddresses: accountAddressesArray,
                status: "pending", // Start as pending until Helius registration
                createdAt: new Date(),
                userId: user.uid, // Make sure to include the user ID
            };

            // Step 1: Add the webhook to Firestore first
            setProgressStatus("Saving webhook configuration...");
            const webhookId = await addWebhook(user.uid, webhookData);

            // Step 2: Register the webhook with Helius
            try {
                await registerHeliusWebhook(webhookId, programIdsArray, accountAddressesArray);

                setSuccess("Webhook created and registered with Helius successfully!");
            } catch (heliusError: any) {
                // If Helius registration fails, we still keep the webhook
                // but mark it as having an error
                console.error("Helius registration failed:", heliusError);
                setError(`Webhook created but Helius registration failed: ${heliusError.message || 'Unknown error'}`);

                // Update the webhook status to reflect the error
                await updateDoc(doc(db, 'webhooks', webhookId), {
                    status: 'error',
                    errorMessage: heliusError.message || 'Unknown error'
                });
            }

            // Reset form
            setFormData({
                name: "",
                description: "",
                databaseId: "",
                tableName: "",
                programIds: "",
                accountAddresses: "",
            });

            // Call the success callback if provided
            if (onSuccess) {
                setTimeout(() => {
                    onSuccess();
                }, 1500); // Small delay to show the success message
            }
        } catch (err: any) {
            console.error("Error creating webhook:", err);
            setError(err.message || "Failed to create webhook. Please try again.");
        } finally {
            setIsSubmitting(false);
            setProgressStatus("");
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic webhook information */}
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Webhook Name</Label>
                    <Input
                        id="name"
                        placeholder="My Program Tracker"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                        id="description"
                        placeholder="Tracking program invocations for XYZ"
                        value={formData.description}
                        onChange={handleInputChange}
                        className="min-h-[60px]"
                    />
                </div>
            </div>

            {/* Database selection */}
            <div className="space-y-2">
                <Label htmlFor="databaseId">Select Database</Label>
                {databases.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-4 text-center">
                            <p className="text-muted-foreground">
                                No databases found. Please connect a database first.
                            </p>
                            <Button className="mt-4" variant="outline" onClick={() => window.location.href = '/dashboard/databases'}>
                                Connect Database
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <Select
                        value={formData.databaseId}
                        onValueChange={(value) => handleSelectChange("databaseId", value)}
                        required
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select a database" />
                        </SelectTrigger>
                        <SelectContent>
                            {databases.map((db) => (
                                <SelectItem key={db.id} value={db.id}>
                                    {db.name} {db.host ? `(${db.host})` : ''}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                )}
            </div>

            {/* Indexer Type Selection */}
            <div className="space-y-2">
                <Label>Indexer Type</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {INDEXER_TYPES.map((type) => (
                        <div
                            key={type.id}
                            className={`
                p-4 rounded-lg border cursor-pointer relative
                ${selectedIndexerType === type.id ? 'border-primary bg-accent/50' : 'border-border'}
                ${type.comingSoon ? 'opacity-60 cursor-not-allowed' : 'hover:border-primary/50'}
              `}
                            onClick={() => !type.comingSoon && setSelectedIndexerType(type.id)}
                        >
                            <h3 className="font-medium">{type.name}</h3>
                            <p className="text-sm text-muted-foreground mt-1">{type.description}</p>

                            {type.comingSoon && (
                                <div className="absolute top-2 right-2 bg-secondary text-secondary-foreground text-xs py-1 px-2 rounded-full">
                                    Coming Soon
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Indexer specific fields */}
            {selectedIndexerType === "program_invocation" && (
                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="tableName">Table Name</Label>
                        <Input
                            id="tableName"
                            placeholder="solana_program_invocations"
                            value={formData.tableName}
                            onChange={handleInputChange}
                        />
                        <p className="text-xs text-muted-foreground">
                            Name of the table where data will be stored. Leave empty to use default.
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="programIds">Program IDs to Track</Label>
                        <Textarea
                            id="programIds"
                            placeholder="Enter Solana program IDs to track (one per line)
Example: TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
                            value={formData.programIds}
                            onChange={handleInputChange}
                            className="min-h-[100px] font-mono text-sm"
                            required
                        />
                        <p className="text-xs text-muted-foreground">
                            Enter Solana program IDs to track (one per line)
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="accountAddresses">Account Addresses (Optional)</Label>
                        <Textarea
                            id="accountAddresses"
                            placeholder="Enter account addresses to filter (one per line)"
                            value={formData.accountAddresses}
                            onChange={handleInputChange}
                            className="min-h-[70px] font-mono text-sm"
                        />
                        <p className="text-xs text-muted-foreground">
                            If provided, only track program invocations related to these accounts
                        </p>
                    </div>
                </div>
            )}

            {/* Progress status */}
            {progressStatus && (
                <div className="flex items-center space-x-2 py-2">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <p className="text-sm">{progressStatus}</p>
                </div>
            )}

            {/* Error and success messages */}
            {error && (
                <div className="p-3 rounded-md bg-destructive/10 text-destructive text-sm">
                    {error}
                </div>
            )}

            {success && (
                <div className="p-3 rounded-md bg-green-500/10 text-green-600 text-sm">
                    {success}
                </div>
            )}

            {/* Submit button */}
            <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting || databases.length === 0}
            >
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Webhook...
                    </>
                ) : (
                    "Create Webhook"
                )}
            </Button>
        </form>
    );
}