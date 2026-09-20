import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'Squeekden — The Professional Network for Rodents', description: 'Where every rat is a thought leader. A HackMIT prototype powered by Boston Open311.' };
export default function RootLayout({children}:{children:React.ReactNode}) {return <html lang="en"><body>{children}</body></html>}
