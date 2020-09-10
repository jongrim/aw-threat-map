import * as React from 'react';
import Tippy from '@tippyjs/react';

export type marker = {
  id: string;
  left: number;
  newLeft?: number;
  top: number;
  newTop?: number;
  title: string;
  imageUrl?: string;
  threatType: string;
  notes?: string;
};

function Marker({
  marker,
  markerPositions,
}: {
  marker: marker;
  markerPositions: { [key: string]: marker };
}) {
  const { id } = marker;

  return (
    <Tippy
      className="threat-card"
      content={<ThreatCard marker={marker} />}
      interactive
      trigger="click"
      placement="right"
      theme="light"
    >
      <p
        className="dot"
        id={id}
        style={{ top: markerPositions[id].top, left: markerPositions[id].left }}
      >
        {marker.title}
      </p>
    </Tippy>
  );
}

function ThreatCard({ marker }: { marker: marker }) {
  return (
    <div className="card">
      <h4>{marker.title}</h4>
      {marker.imageUrl && <img src={marker.imageUrl} alt={marker.title} />}
      <div className="card-notes-content">{marker.notes}</div>
      <div className="card-threat-type">{marker.threatType}</div>
    </div>
  );
}

export default React.memo(Marker, (prevProps, nextProps) => {
  return true;
});
