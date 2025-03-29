"use client"

import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

export function DataSelectionForm() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="accounts">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="accounts">Accounts</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="programs">Programs</TabsTrigger>
          <TabsTrigger value="tokens">Tokens</TabsTrigger>
        </TabsList>

        <TabsContent value="accounts" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="account_addresses">Account Addresses</Label>
            <Textarea
              id="account_addresses"
              placeholder="Enter Solana account addresses (one per line)"
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Track specific Solana accounts. We'll index all activity related to these accounts.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Data to Index</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="account_balance" defaultChecked />
                <Label htmlFor="account_balance" className="text-sm">
                  Account Balance
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="account_owner" defaultChecked />
                <Label htmlFor="account_owner" className="text-sm">
                  Account Owner
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="account_data" defaultChecked />
                <Label htmlFor="account_data" className="text-sm">
                  Account Data
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="account_executable" />
                <Label htmlFor="account_executable" className="text-sm">
                  Executable Status
                </Label>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label>Transaction Types</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="sol_transfer" defaultChecked />
                <Label htmlFor="sol_transfer" className="text-sm">
                  SOL Transfers
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="token_transfer" defaultChecked />
                <Label htmlFor="token_transfer" className="text-sm">
                  Token Transfers
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="nft_sales" />
                <Label htmlFor="nft_sales" className="text-sm">
                  NFT Sales
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="program_invocations" />
                <Label htmlFor="program_invocations" className="text-sm">
                  Program Invocations
                </Label>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Transaction Details</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="tx_signatures" defaultChecked />
                <Label htmlFor="tx_signatures" className="text-sm">
                  Signatures
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="tx_timestamp" defaultChecked />
                <Label htmlFor="tx_timestamp" className="text-sm">
                  Timestamp
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="tx_fee" defaultChecked />
                <Label htmlFor="tx_fee" className="text-sm">
                  Transaction Fee
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="tx_status" defaultChecked />
                <Label htmlFor="tx_status" className="text-sm">
                  Status
                </Label>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="programs" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="program_ids">Program IDs</Label>
            <Textarea
              id="program_ids"
              placeholder="Enter Solana program IDs (one per line)"
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Track specific Solana programs. We'll index all invocations of these programs.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Program Data</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="program_invocation_count" defaultChecked />
                <Label htmlFor="program_invocation_count" className="text-sm">
                  Invocation Count
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="program_accounts" defaultChecked />
                <Label htmlFor="program_accounts" className="text-sm">
                  Program Accounts
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="program_instructions" />
                <Label htmlFor="program_instructions" className="text-sm">
                  Instructions
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="program_errors" />
                <Label htmlFor="program_errors" className="text-sm">
                  Errors
                </Label>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="tokens" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="token_mints">Token Mints</Label>
            <Textarea
              id="token_mints"
              placeholder="Enter token mint addresses (one per line)"
              className="min-h-[100px]"
            />
            <p className="text-xs text-muted-foreground">
              Track specific tokens. We'll index all transfers and other activities for these tokens.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Token Data</Label>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex items-center space-x-2">
                <Checkbox id="token_supply" defaultChecked />
                <Label htmlFor="token_supply" className="text-sm">
                  Token Supply
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="token_holders" defaultChecked />
                <Label htmlFor="token_holders" className="text-sm">
                  Token Holders
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="token_transfers" defaultChecked />
                <Label htmlFor="token_transfers" className="text-sm">
                  Transfers
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="token_metadata" />
                <Label htmlFor="token_metadata" className="text-sm">
                  Metadata
                </Label>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      <div className="space-y-2">
        <Label>Data Frequency</Label>
        <RadioGroup defaultValue="realtime">
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="realtime" id="realtime" />
            <Label htmlFor="realtime">Real-time (via webhooks)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="hourly" id="hourly" />
            <Label htmlFor="hourly">Hourly batch updates</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="daily" id="daily" />
            <Label htmlFor="daily">Daily batch updates</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-2">
        <Label htmlFor="table_prefix">Database Table Prefix (Optional)</Label>
        <Input id="table_prefix" placeholder="solana_" />
        <p className="text-xs text-muted-foreground">
          All created tables will be prefixed with this value (e.g., solana_accounts, solana_transactions)
        </p>
      </div>
    </div>
  )
}

