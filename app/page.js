'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'

export default function Home() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [session, setSession] = useState(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      // Example: fetching from a table named 'test_table'
      // You should replace 'test_table' with an actual table name from your Supabase database
      const { data, error } = await supabase
        .from('test_table')
        .select('*')

      if (error) {
        console.error('Error fetching data:', error)
      } else {
        setData(data || [])
      }
      setLoading(false)
    }

    if (session) {
      fetchData()
    }
  }, [session])

  const handleLogout = async () => {
    await supabase.auth.signOut()
  }

  if (!session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-24">
        <h1 className="text-4xl font-bold mb-8">Welcome to My Fishtory</h1>
        <p className="mb-4">Please log in to see the fish.</p>
        <Link href="/login" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Go to Login
        </Link>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center p-24">
      <div className="w-full max-w-5xl flex justify-between items-center mb-12">
        <h1 className="text-4xl font-bold">My Fishtory Data</h1>
        <button onClick={handleLogout} className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
          Logout
        </button>
      </div>

      {loading ? (
        <p>Loading data...</p>
      ) : (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.length === 0 ? (
            <p>No data found (or 'test_table' does not exist).</p>
          ) : (
            data.map((item, index) => (
              <div key={index} className="p-4 border rounded shadow">
                <pre>{JSON.stringify(item, null, 2)}</pre>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
