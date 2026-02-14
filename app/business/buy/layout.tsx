import { BusinessBuyProvider } from './_context/buy-context';

export default function BuyLayout({ children }: { children: React.ReactNode }) {
    return (
        <BusinessBuyProvider>
            {children}
        </BusinessBuyProvider>
    );
}
