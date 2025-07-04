'use client'

import Link from 'next/link'
import { useState, useEffect, ReactNode } from 'react'
import { usePathname } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../../lib/firebase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import type { StaticImageData } from 'next/image'
import defaultProfilePic from '../../public/avatar.jpeg'

import { 
  FaChartBar, 
  FaUsers, 
  FaMoneyBillWave, 
  FaHammer, 
  FaBell,
  FaBuilding,
  FaSignOutAlt,
  FaComment
} from 'react-icons/fa'

export default function LandlordLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const router = useRouter()
  const [user, setUser] = useState(null)
  const [role, setRole] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [profilePic, setProfilePic] = useState<string | StaticImageData>(defaultProfilePic)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      if(currentUser === null) return
      getDoc(doc(db, 'users', currentUser?.uid)).then((doc) => {
        setRole(doc.data()?.role)
      })
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return

      try {
        const userRef = doc(db, 'users', user.uid)
        const userSnap = await getDoc(userRef)

        if (userSnap.exists()) {
          const data = userSnap.data()
          setDisplayName(data.displayName || '')
          setEmail(data.email || '')
          setProfilePic(user.photoURL || defaultProfilePic)
        } else {
          console.warn('User document not found')
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    fetchUserData()
  }, [user])
  
  const handleLogout = async () => {
    await signOut(auth)
    router.push('/login')
  }

  const toggleSidebar = () => setSidebarOpen(open => !open)

  const menuItems = [
    { name: 'Dashboard', path: '/landlord_portal', icon: <FaChartBar /> },
    { name: 'Tenants', path: '/landlord_portal/tenants', icon: <FaUsers /> },
    { name: 'Properties', path: '/landlord_portal/properties', icon: <FaBuilding /> },
    { name: 'Payments', path: '/landlord_portal/payments', icon: <FaMoneyBillWave /> },
    { name: 'Maintenance', path: '/landlord_portal/maintenance', icon: <FaHammer /> },
    { name: 'Suggestions', path: '/landlord_portal/suggestions', icon: <FaComment /> }
  ]

  if(!user) return <p className="info-text">You are not logged in</p>

  if (role === 'tenant' && user) return <p className="info-text">You are logged in as a tenant</p>

  if (role === 'landlord' && user) return (
    <div className="root">
      <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
        <div className="logo">
          <span className="brand">RentAssist</span>
          <span className="subtitle">Landlord Portal</span>
        </div>
        <nav className="main-menu">
          <div className="menu-title">Main Menu</div>
          <ul>
            {menuItems.map(item => (
              <Link href={item.path} key={item.path}>
                <li className={pathname === item.path ? 'active' : ''}>
                  <span className="icon">{item.icon}</span>
                  <span className="label">{item.name}</span>
                </li>
              </Link>
            ))}
          </ul>
        </nav>
        <div className="profile">
          <Image src={profilePic} alt="Profile Pic" className="avatar" width={40} height={40} />
          <div className="profile-info">
            <div className="profile-name">{displayName}</div>
            <div className="profile-email">{email}</div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            <span>Logout <FaSignOutAlt /></span>
          </button>
        </div>
      </aside>

      <main className={`main-content ${isSidebarOpen ? 'with-sidebar' : 'full-width'}`}>
        <header className="main-header">
          <button className="sidebar-toggle-btn" onClick={toggleSidebar}>
            {isSidebarOpen ? '✕' : '☰'}
          </button>
          <input className="search" placeholder="Search..." />
          <div className="header-actions">
            <span className="notif-badge">
              <FaBell /> 
              <span>3</span>
            </span>
          </div>
        </header>

        {children}
      </main>
    </div>
  )
}
