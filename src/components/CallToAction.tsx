import Image from 'next/image'
import Link from 'next/link'

import { Container } from '@/components/Container'
import backgroundImage from '@/images/background-call-to-action.jpg'

export function CallToAction() {
  return (
    <section
      id="get-started-today"
      className="relative overflow-hidden bg-blue-600 py-32"
    >
      <Image
        className="absolute top-1/2 left-1/2 max-w-none -translate-x-1/2 -translate-y-1/2"
        src={backgroundImage}
        alt=""
        width={2347}
        height={1244}
        unoptimized
      />
      <Container className="relative">
        <div className="mx-auto max-w-lg text-center">
          <h2 className="font-display text-3xl tracking-tight text-white sm:text-4xl">
            Ready to Join Your First Cliq?
          </h2>
          <p className="mt-4 text-lg tracking-tight text-white">
            Connect with friends and family in a private, ad-free space designed for meaningful conversations.
          </p>
          <Link 
            href="/sign-up" 
            className="mt-10 inline-block bg-[#202020] text-white px-6 py-3 rounded-md font-semibold hover:bg-[#5939d4] transition text-lg"
          >
            Start Free Today
          </Link>
        </div>
      </Container>
    </section>
  )
}
