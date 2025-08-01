'use client'

import Loading from '../../components/loading'
import { useState, useEffect } from 'react'
import { db, auth } from '../../../lib/firebase'
import {
  collection,
  getDocs,
  query,
  where
} from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import Image from 'next/image'
import defaultProfilePic from '../../../public/avatar.jpeg'
import { Tenant } from '../../types'

export default function TenantsPage() {
  const [tenantsMap, setTenantsMap] = useState({})
  const [selectedProperty, setSelectedProperty] = useState('')
  const [allProperties, setAllProperties] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await fetchTenants(user.uid)
      }
    })
    return () => unsubscribe()
  }, [])

  const fetchTenants = async (uid) => {
    setLoading(true)
    const q = query(collection(db, 'properties'), where('createdBy', '==', uid))
    const snapshot = await getDocs(q)
    setAllProperties(snapshot.docs.map((docSnap) => docSnap.data().name))

    const tempMap = {}

    for (const docSnap of snapshot.docs) {
      const property = docSnap.data()
      const propertyName = property.name || 'Unknown Property'
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
    setLoading(false)
  }

  if (loading) return <Loading />

  return (
    <div>
      <section className="tenant-section">
        <h2 className="heading-h2">Tenants</h2>
        <p className="heading-p">Here's an overview of your tenants</p>
        <label className="heading-p">Select Property: </label>
        <select
          value={selectedProperty}
          onChange={e => setSelectedProperty(e.target.value)}
          className="dropdown"
        >
          <option value="">All</option>
          {allProperties.map((property) => (
            <option key={property} value={property}>
              {property}
            </option>
          ))}
          
        </select>
        <table className="tenant-table" style={{ marginTop: '1.5em'}}>
          {selectedProperty == "" && (
            <>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Properties Joined</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(tenantsMap).map((tenant : Tenant, idx) => (
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
            </>
          )}

          {selectedProperty !== "" && (
            <>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                {Object.values(tenantsMap).filter((tenant : Tenant) => tenant.properties.includes(selectedProperty)).map((tenant : Tenant, idx) => (
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
                  </tr>
                  ))}
                </tbody>
            </>
          )}

        </table>
        {Object.keys(tenantsMap).length === 0 && <p className="no-tenants" style={{ textAlign: 'center' }}>No tenants found</p>}
      </section>
    </div>
  )
}
