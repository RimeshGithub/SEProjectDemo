'use client'

import Loading from '../components/loading'
import { useEffect, useState } from 'react'
import { db, auth } from '../../lib/firebase'
import {
  collection,
  getDocs,
  query
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'

import {  
  FaBuilding
} from 'react-icons/fa'

export default function Home() {
  const [availableProperties, setAvailableProperties] = useState([])
  const [joinedProperties, setJoinedProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) return
      fetchProperties(currentUser.email)
    })
    return () => unsubscribe()
  }, [])

  const fetchProperties = async (email: string) => {
    setLoading(true)
    const q = query(collection(db, 'properties'))
    const snapshot = await getDocs(q)
    const all = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    const joined = all.filter((prop: any) =>
      (prop.tenants || []).some((t: any) => t.email === email)
    )

    const notJoined = all.filter((prop: any) =>
      !(prop.tenants || []).some((t: any) => t.email === email) &&
      (prop.tenants?.length || 0) < (prop.rooms || 0) // <-- exclude full properties
    )

    setJoinedProperties(joined)
    setAvailableProperties(notJoined)

    setLoading(false)
  }

  if (loading) return <Loading />

  return (
    <>
      <section>
        <h2 className="heading-h2">Dashboard</h2>
        <p className="heading-p">Here's an overview of joined properties and available properties</p>
      </section>

      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Joined Properties <FaBuilding /></div>
          <div className="metric-value">{joinedProperties.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Available Properties <FaBuilding /></div>
          <div className="metric-value">{availableProperties.length}</div>
        </div>
      </section>

      <section className="tenant-activity-wrapper" style={{ display: 'flex', flexDirection: 'column' }}>
        <section className="property-section">
          <h3>Joined Properties</h3>
          <div className="property-cards" style={{ flexDirection: 'row' }}>
            {joinedProperties.length !=0 ? joinedProperties.slice(0, 3).map((property, idx) => (
              <div className="property-card" key={idx} style={{ maxWidth: '300px' }}>
                <div className="property-title">{property.name}</div>
                <div>Location: {property.location}</div>
                <div>Rooms: {property.rooms}</div>
                <div>Tenants: {property.tenants.length}</div>
                <div>Owner: {property.ownerName}</div>
              </div>
            )) : "No joined properties"}
          </div>
        </section>

        <section className="property-section">
            <h3>Available Properties</h3>
            <div className="property-cards" style={{ flexDirection: 'row' }}>
            {availableProperties.length != 0 ? availableProperties.slice(0, 3).map((property, idx) => (
              <div className="property-card" key={idx} style={{ maxWidth: '300px' }}>
                <div className="property-title">{property.name}</div>
                <div>Location: {property.location}</div>
                <div>Rooms: {property.rooms}</div>
                <div>Tenants: {property.tenants.length}</div>
                <div>Owner: {property.ownerName}</div>
              </div>
            )) : "No available properties"}
          </div>
        </section>
      </section>
    </>
  )
}
