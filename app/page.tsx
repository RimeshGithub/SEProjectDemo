import Link from 'next/link'
import Image from 'next/image'
import Logo from '../public/logo.png'

export default function Home() {
    return (
      <div className="home-container">
        <Image src={Logo} alt="Logo" width={420} height={120} />
        <p className="home-description">
          Simplifying property management for landlords and tenants. Track payments, handle maintenance, manage tenants — all in one platform
        </p>
        <Link href="/login">
          <button className="login-button">Login</button>
        </Link>
      </div>
    )
  }






