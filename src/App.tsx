import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import TodoPage from './TodoPage'
import { ThemeProvider } from './components/theme-provider'
import { Navbar } from './components/navbar'

const queryClient = new QueryClient()

function App() {
  return (
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen bg-background text-foreground">
          <Navbar />
          <main className="container mx-auto p-4">
            <TodoPage />
          </main>
        </div>
      </QueryClientProvider>
    </ThemeProvider>
  )
}

export default App