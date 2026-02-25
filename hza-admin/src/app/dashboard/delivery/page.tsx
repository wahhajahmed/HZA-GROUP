import { getDeliveryCharges } from '@/services/delivery.service';
import DeliveryChargesManager from './DeliveryChargesManager';

export const dynamic = 'force-dynamic';

export default async function DeliveryPage() {
  const charges = await getDeliveryCharges();
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Area-wise Delivery Charges</h1>
        <p className="text-sm text-gray-500 mt-1">
          Set delivery charges per city &rarr; area for each shipping category (Small Parcel, Medium Parcel, Bulky Cargo).
        </p>
      </div>
      <DeliveryChargesManager charges={charges} />
    </div>
  );
}

