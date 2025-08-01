'use client'

import { useState, useEffect } from 'react'
import { db, auth } from '../../lib/firebase'
import {
  collection,
  getDocs,
  query,
  where,
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import Image from 'next/image'
import defaultProfilePic from '../../public/avatar.jpeg'
import Loading from '../components/loading'
import { Tenant } from '../types'

import {  
  FaUsers, 
  FaDoorOpen, 
  FaBuilding,
  FaPercentage
} from 'react-icons/fa'

export default function Home() {
  const [roomsCount, setRoomsCount] = useState(0)
  const [properties, setProperties] = useState([])
  const [tenantsMap, setTenantsMap] = useState({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchAll(user.uid)
      }
    })
    return () => unsubscribe()
    
  }, [])

  const fetchAll = async (uid) => {
    setLoading(true)

    const q = query(collection(db, 'properties'), where('createdBy', '==', uid))
    const snapshot = await getDocs(q)

    const props = []

    for (const docSnap of snapshot.docs) {
      const property = { id: docSnap.id, name: docSnap.data().name, ...docSnap.data() }
      props.push(property)
    }

    const tempMap = {}

    for (const docSnap of snapshot.docs) {
      const property = docSnap.data()
      const propertyName = property.name || 'Unknown Property'
      const rooms = property.rooms || 0
      setRoomsCount(roomsCount => roomsCount + rooms)
      const tenants = property.tenants || []

      tenants.forEach((tenant) => {
        if (!tempMap[tenant.email]) {
          tempMap[tenant.email] = {
            name: tenant.name,
            email: tenant.email,
            photoURL: tenant.photoURL || null,
            properties: [propertyName]
          }
        } else {
          tempMap[tenant.email].properties.push(propertyName)
        }
      })
    }

    setTenantsMap(tempMap)
    setProperties(props)
  
    console.log(properties)
    setLoading(false)
  }

  if (loading) return <Loading />

  return (
    <>
      <section>
        <h2 className='heading-h2'>Dashboard</h2>
        <p className='heading-p'>Here's an overview of your tenants and properties</p>
      </section>

      <section className="metrics-grid">
        <div className="metric-card">
          <div className="metric-label">Properties <FaBuilding /></div>
          <div className="metric-value">{properties.length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Rooms <FaDoorOpen /></div>
          <div className="metric-value">{roomsCount}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Tenants <FaUsers /></div>
          <div className="metric-value">{Object.keys(tenantsMap).length}</div>
        </div>
        <div className="metric-card">
          <div className="metric-label">Occupancy Rate <FaPercentage /></div>
          <div className="metric-value">{(Object.keys(tenantsMap).length / roomsCount * 100).toFixed(2) === 'NaN' ? '0.00' : 
          (Object.keys(tenantsMap).length / roomsCount * 100).toFixed(2) || 0}%</div>
        </div>
      </section>

      <section className="tenant-activity-wrapper">
        <section className="tenant-section">
          <h3>Tenants</h3>
          <table className="tenant-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Properties Joined</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(tenantsMap).slice(0, 3).map((tenant : Tenant, idx) => (
                <tr key={idx}>
                  <td className="name">
                    <Image
                      src={tenant.photoURL || defaultProfilePic}
                      alt="Profile Pic"
                      className="avatar"
                      width={35}
                      height={35}
                    />
                    {tenant.name}
                  </td>
                  <td>{tenant.email}</td>
                  <td style={{ width: '400px' }}>{tenant.properties.join(', ')}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {Object.keys(tenantsMap).length === 0 && <p className="no-tenants" style={{ textAlign: 'center' }}>No tenants found</p>}
        </section>

        <section className="property-section">
          <h3>Properties Overview</h3>
          <div className="property-cards">
            {properties.length != 0 ? properties.slice(0, 2).map((property, idx) => (
              <div className="property-card" key={idx}>
                <div className="property-title">{property.name}</div>
                <div>Location: {property.location}</div>
                <div>Rooms: {property.rooms}</div>
                <div>Tenants: {property.tenants.length}</div>
              </div>
            )) : "No properties found"}
          </div>
        </section>
      </section>
    </>
  )
}
