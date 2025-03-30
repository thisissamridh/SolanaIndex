import Link from "next/link"
import { ArrowRight, Database, Layers, Shield, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="px-4 lg:px-6 h-16 flex items-center border-b border-green-900/20 max-w-screen-2xl mx-auto w-full">
        <Link className="flex items-center justify-center" href="#">
          <Layers className="h-6 w-6 text-green-500" />
          <span className="ml-2 text-xl font-bold bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
            SolanaIndex
          </span>
        </Link>
        <nav className="ml-auto flex gap-4 sm:gap-6">
          <Link
            className="text-sm font-medium text-gray-300 hover:text-green-400 hover:underline underline-offset-4"
            href="#txk"
          >
            Features
          </Link>
          {/* <Link
            className="text-sm font-medium text-gray-300 hover:text-green-400 hover:underline underline-offset-4"
            href="#"
          >
            Pricing
          </Link> */}
          <Link
            className="text-sm font-medium text-gray-300 hover:text-green-400 hover:underline underline-offset-4"
            href="/documentation"
          >
            Documentation
          </Link>
          {/* <Link
            className="text-sm font-medium text-gray-300 hover:text-green-400 hover:underline underline-offset-4"
            href="#"
          >
            Blog
          </Link> */}
        </nav>
        <div className="ml-4 flex items-center gap-2">
          <Link href="/login">
            <Button variant="ghost" size="sm" className="text-gray-300 hover:text-white hover:bg-green-900/20">
              Log In
            </Button>
          </Link>
          <Link href="/signup">
            <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white">
              Sign Up
            </Button>
          </Link>
        </div>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 bg-black">
          <div className="container px-4 md:px-6 mx-auto max-w-screen-xl">
            <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
                    Solana Data Indexing Made Simple
                  </h1>
                  <p className="max-w-[600px] text-gray-400 md:text-xl">
                    Collect and store Solana blockchain data in your Postgres database without complex infrastructure.
                    Powered by Helius.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Link href="/signup">
                    <Button size="lg" className="gap-1.5 bg-green-600 hover:bg-green-700 text-white">
                      Get Started
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href="/documentation">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-green-700 text-green-400 hover:bg-green-900/20"
                    >
                      Documentation
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full h-[250px] sm:h-[300px] md:h-[350px] lg:h-[450px] bg-gradient-to-br from-green-900/30 to-green-700/10 rounded-lg overflow-hidden border border-green-900/50">
                  <div className="absolute inset-0 flex items-center justify-center p-4">
                    <div className="w-full sm:w-4/5 md:w-3/4 h-full sm:h-4/5 md:h-3/4 bg-black/80 backdrop-blur-sm rounded-lg shadow-lg flex items-center justify-center border border-green-900/50">
                      <img
                        src="/ff.png"
                        alt="Database Connection"
                        className="rounded-lg max-w-[200px] sm:max-w-[250px] md:max-w-[300px] lg:max-w-[400px] h-auto object-contain p-2 sm:p-4"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Other sections with proper container classes */}
        <section className="w-full py-12 md:py-24 lg:py-32 bg-black">
          <div className="container px-4 md:px-6 mx-auto max-w-screen-xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <div className="inline-block rounded-lg bg-green-900/50 px-3 py-1 text-sm text-green-300 border border-green-700/50">
                  How It Works
                </div>
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
                  Three Simple Steps
                </h2>
                <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Get your Solana data flowing into your database in minutes, not weeks.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-3 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4 rounded-lg border border-green-900/50 bg-black/50 p-6 shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-900/30 text-green-400 border border-green-700/50">
                  <Database className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-green-400">1. Connect Database</h3>
                  <p className="text-gray-400">
                    Securely connect your Postgres database with our simple configuration wizard.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4 rounded-lg border border-green-900/50 bg-black/50 p-6 shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-900/30 text-green-400 border border-green-700/50">
                  <Layers className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-green-400">2. Select Data</h3>
                  <p className="text-gray-400">
                    Choose what Solana data you want to track - accounts, programs, transactions, or tokens.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-center space-y-4 rounded-lg border border-green-900/50 bg-black/50 p-6 shadow-lg">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-900/30 text-green-400 border border-green-700/50">
                  <Zap className="h-6 w-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-bold text-green-400">3. Data Flows</h3>
                  <p className="text-gray-400">
                    We handle the indexing and automatically push data to your database in real-time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>


        <section id="txk" className="w-full py-12 md:py-24 lg:py-32 bg-black">
          <div className="container px-4 md:px-6 mx-auto max-w-screen-xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
                  Key Features
                </h2>
                <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Everything you need to build powerful Solana applications without the infrastructure headaches.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl items-center gap-6 py-12 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-900/30 text-green-400 border border-green-700/50">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-green-400">No Infrastructure Management</h3>
                      <p className="text-gray-400">
                        Focus on building your application, not managing complex blockchain infrastructure.
                      </p>
                    </div>
                  </li>
                  {/* Other list items */}
                </ul>
              </div>
              <div className="flex flex-col justify-center space-y-4">
                <ul className="grid gap-6">
                  <li className="flex items-start gap-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-900/30 text-green-400 border border-green-700/50">
                      <Layers className="h-4 w-4" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-xl font-bold text-green-400">Flexible Data Selection</h3>
                      <p className="text-gray-400">
                        Choose exactly what blockchain data you need - from specific accounts to transaction types.
                      </p>
                    </div>
                  </li>
                  {/* Other list items */}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="w-full py-12 md:py-24 lg:py-32 bg-black">
          <div className="container px-4 md:px-6 mx-auto max-w-screen-xl">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl bg-gradient-to-r from-green-400 to-green-600 text-transparent bg-clip-text">
                  Ready to Get Started?
                </h2>
                <p className="max-w-[900px] text-gray-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                  Start indexing Solana data into your database in minutes.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/signup">
                  <Button size="lg" className="gap-1.5 bg-green-600 hover:bg-green-700 text-white">
                    Create Free Account
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/contact">
                  <Button size="lg" variant="outline" className="border-green-700 text-green-400 hover:bg-green-900/20">
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t border-green-900/20 bg-gradient-to-b from-black to-green-950 ">
        <div className="container mx-auto max-w-screen-2xl flex flex-col sm:flex-row w-full justify-between items-center">
          <p className="text-xs text-gray-500">© {new Date().getFullYear()} SolanaIndex. All rights reserved.</p>
          <nav className="sm:ml-auto flex gap-4 sm:gap-6">
            <Link className="text-xs text-gray-500 hover:text-green-400 hover:underline underline-offset-4" href="#">
              Terms of Service
            </Link>
            <Link className="text-xs text-gray-500 hover:text-green-400 hover:underline underline-offset-4" href="#">
              Privacy
            </Link>
            <Link className="text-xs text-gray-500 hover:text-green-400 hover:underline underline-offset-4" href="#">
              Documentation
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  )
}

