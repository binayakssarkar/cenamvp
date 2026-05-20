import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Popup
} from 'react-leaflet';

import 'leaflet/dist/leaflet.css';



export default function RiskMap({
  suppliers
}: any) {

  return (

    <MapContainer
      center={[25, 20]}
      zoom={2}
      style={{
        height: '100%',
        width: '100%'
      }}
    >

      <TileLayer
  attribution='&copy; OpenStreetMap'
  url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
/>

      {suppliers.map(
        (supplier: any, idx: number) => {

          if (
  supplier.lat == null ||
  supplier.lng == null
) return null;

const coords: [number, number] = [
  Number(supplier.lat),
  Number(supplier.lng)
];

          return (

            <CircleMarker
             key={supplier.vendor_identity}

              center={coords}

              radius={
                Number(
                  supplier.risk_index
                ) > 7
                  ? 16
                  : Number(
                      supplier.risk_index
                    ) > 4
                  ? 11
                  : 8
              }

              pathOptions={{

                color:
                  supplier.sanctioned
                    ? '#991b1b'
                    : Number(
                        supplier.risk_index
                      ) > 7
                    ? '#ef4444'
                    : '#f59e0b',

                fillOpacity: 0.7
              }}
            >

              <Popup>

                <div>

                  <strong>
                    {supplier.vendor_identity}
                  </strong>

                  <br />

                  Region:
                  {' '}
                  {supplier.city}, {supplier.country}

                  <br />

                  Risk:
                  {' '}
                  {supplier.risk_index}

                  <br />

                  Status:
                  {' '}
                  {supplier.sanctioned
                    ? 'SANCTIONED'
                    : 'MONITORED'}

                </div>

              </Popup>

            </CircleMarker>
          );
        }
      )}

    </MapContainer>
  );
}