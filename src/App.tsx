import React from 'react';
import Map from './Map';
import Marker, { marker } from './Marker';
import { gsap, Draggable } from 'gsap/all';
import { Machine } from 'xstate';
import { useMachine } from '@xstate/react';
import { TweenMax, Elastic } from 'gsap';
import useLocalStorage from './hooks/useLocalStorage';
import './App.css';
import 'tippy.js/themes/light.css';
import 'tippy.js/dist/tippy.css';

gsap.registerPlugin(Draggable);

const defaultMarkers = [
  {
    left: 50,
    top: 50,
    id: 'dot-1',
    title: 'Tibelt',
    notes: 'Best of the best',
    imageUrl: '',
    threatType: 'Clan',
  },
  {
    left: 361.27,
    top: 542.3,
    id: 'dot-2',
    title: 'Romeo',
    notes: 'Best of the best',
    imageUrl: '',
    threatType: 'Clan',
  },
  {
    left: 418.25,
    top: 119.89,
    id: 'dot-3',
    title: 'Maria Firestorm',
    notes: 'Best of the best',
    imageUrl: '',
    threatType: 'Clan',
  },
];

const defaultMarkerPositions = {
  'dot-1': {
    left: 50,
    top: 50,
    id: 'dot-1',
    title: 'Tibelt',
    notes: 'Best of the best',
    imageUrl: '',
    threatType: 'Clan',
  },
  'dot-2': {
    left: 361.27,
    top: 542.3,
    id: 'dot-2',
    title: 'Romeo',
    notes: 'Best of the best',
    imageUrl: '',
    threatType: 'Clan',
  },
  'dot-3': {
    left: 418.25,
    top: 119.89,
    id: 'dot-3',
    title: 'Maria Firestorm',
    notes: 'Best of the best',
    imageUrl: '',
    threatType: 'Clan',
  },
};

function App() {
  return (
    <div className="App">
      <MarkerProvider>
        <div className="map-container">
          <Map />
          <Markers />
        </div>
        <Sidebar />
      </MarkerProvider>
    </div>
  );
}

type markerContextType = {
  markers: marker[];
  markerPositions: { [key: string]: marker };
  addNewMarker: (arg0: marker) => void;
};
const MarkerContext = React.createContext<markerContextType>({
  markers: [],
  markerPositions: {},
  addNewMarker: () => {},
});

const updateMarker = ({
  marker,
  newLeft,
  newTop,
}: {
  marker: marker;
  newLeft: number;
  newTop: number;
}) => ({
  ...marker,
  left: marker.left + newLeft,
  top: marker.top + newTop,
});

const MarkerProvider: React.FC = ({ children }) => {
  const [markers, setMarkers] = useLocalStorage<marker[]>(
    'markers',
    defaultMarkers
  );
  const [markerPositions, setMarkerPositions] = useLocalStorage<{
    [key: string]: marker;
  }>('markerPositions', defaultMarkerPositions);

  const onDragEnd = React.useCallback(
    ({
      id,
      newLeft,
      newTop,
    }: {
      id: string;
      newLeft: number;
      newTop: number;
    }) => {
      const newMarker = updateMarker({
        marker: markerPositions[id],
        newLeft,
        newTop,
      });
      setMarkerPositions((map: {}) => ({
        ...map,
        [id]: newMarker,
      }));
    },
    [markerPositions, setMarkerPositions]
  );

  React.useEffect(() => {
    Draggable.create(
      markers.map(({ id }) => `#${id}`),
      {
        type: 'x,y',
        onDragEnd: function () {
          console.log(this.target.id, this.endX, this.endY);
          onDragEnd({
            id: this.target.id,
            newLeft: this.endX,
            newTop: this.endY,
          });
        },
      }
    );
  }, [markers, onDragEnd]);

  const addNewMarker = ({
    id,
    title,
    imageUrl,
    notes,
    threatType,
    left,
    top,
  }: marker) => {
    const newMarker = {
      id,
      title,
      imageUrl,
      notes,
      threatType,
      left,
      top,
    };
    setMarkers((curMarkers: marker[]) => {
      return [...curMarkers, newMarker];
    });
    setMarkerPositions((cur) => ({
      ...cur,
      [id]: newMarker,
    }));
  };

  return (
    <MarkerContext.Provider value={{ markers, addNewMarker, markerPositions }}>
      {children}
    </MarkerContext.Provider>
  );
};

function Markers() {
  const { markers, markerPositions } = React.useContext(MarkerContext);
  return (
    <>
      {markers.map((marker) => (
        <Marker
          marker={marker}
          markerPositions={markerPositions}
          key={marker.id}
        />
      ))}
    </>
  );
}

interface SidebarMachineSchema {
  states: {
    closed: {};
    closing: {};
    open: {};
    opening: {};
  };
}

type SidebarEvent = { type: 'OPEN' } | { type: 'CLOSE' };

const SidebarMachine = Machine<SidebarMachineSchema, SidebarEvent>({
  id: 'sidebar',
  initial: 'closed',
  states: {
    closed: {
      on: {
        OPEN: { target: 'opening' },
      },
    },
    closing: {
      on: {
        OPEN: { target: 'opening' },
      },
      invoke: {
        src: 'closeMenu',
        onDone: {
          target: 'closed',
        },
      },
      entry: ['setToggleIconOff'],
    },
    opening: {
      on: {
        CLOSE: { target: 'closing' },
      },
      invoke: {
        src: 'openMenu',
        onDone: {
          target: 'open',
        },
      },
      entry: ['setToggleIconOn'],
    },
    open: {
      on: {
        CLOSE: { target: 'closing' },
      },
    },
  },
});

const nextMessageMap: { [key: string]: SidebarEvent } = {
  closed: { type: 'OPEN' },
  closing: { type: 'OPEN' },
  open: { type: 'CLOSE' },
  opening: { type: 'CLOSE' },
};

function Sidebar() {
  const element = React.useRef(null);
  const openMenu = React.useCallback(() => {
    return new Promise((resolve) => {
      TweenMax.to(element.current || {}, 0.5, {
        right: 0,
        backdropFilter: 'blur(5px)',
        ease: Elastic.easeOut.config(1, 1),
        onComplete: resolve,
      });
    });
  }, []);
  const closeMenu = React.useCallback(() => {
    return new Promise((resolve) => {
      TweenMax.to(element.current || {}, 0.5, {
        right: -600,
        backdropFilter: 'blur(0px)',
        ease: Elastic.easeOut.config(1, 1),
        onComplete: resolve,
      });
    });
  }, []);

  const [current, send] = useMachine(SidebarMachine, {
    services: {
      openMenu,
      closeMenu,
    },
  });

  const nextMessage: SidebarEvent = nextMessageMap[current.value.toString()];

  const { addNewMarker } = React.useContext(MarkerContext);

  const [title, setTitle] = React.useState('');
  const [imageUrl, setImageUrl] = React.useState('');
  const [notes, setNotes] = React.useState('');
  const [threatType, setThreatType] = React.useState('');

  const clearForm = () => {
    setTitle('');
    setImageUrl('');
    setNotes('');
    setThreatType('');
  };

  return (
    <div>
      <button className="add-new-btn" onClick={() => send(nextMessage)}>
        Add New
      </button>
      <div className="sidebar" ref={element}>
        <form
          className="pure-form pure-form-aligned"
          onSubmit={(e) => {
            e.preventDefault();
            addNewMarker({
              id: title,
              title,
              imageUrl,
              notes,
              threatType,
              left: 0,
              top: 0,
            });
            clearForm();
          }}
        >
          <div className="pure-control-group">
            <label htmlFor="title">Title</label>
            <input
              className="pure-input-2-3"
              name="title"
              id="title"
              value={title}
              onChange={({ target }) => setTitle(target.value)}
              required
            />
          </div>
          <div className="pure-control-group">
            <label htmlFor="imageUrl">Image URL</label>
            <input
              className="pure-input-2-3"
              name="imageUrl"
              id="imageUrl"
              value={imageUrl}
              onChange={({ target }) => setImageUrl(target.value)}
            />
          </div>
          <div className="pure-control-group">
            <label htmlFor="notes">Notes</label>
            <textarea
              className="pure-input-2-3"
              rows={5}
              name="notes"
              id="notes"
              value={notes}
              onChange={({ target }) => setNotes(target.value)}
            />
          </div>
          <div className="pure-control-group">
            <label htmlFor="threatType">Threat Type</label>
            <select
              className="pure-input-2-3"
              name="threatType"
              value={threatType}
              onChange={({ target }) => setThreatType(target.value)}
              required
            >
              <optgroup label="CLANS">
                <option>A Cult</option>
                <option>Enforcers</option>
                <option>A Family</option>
                <option>A Hunting pack</option>
                <option>A Mob</option>
                <option>Sybarites</option>
              </optgroup>
              <optgroup label="DISEASES">
                <option>Addiction</option>
                <option>Delusion</option>
                <option>Frailty</option>
                <option>Infection</option>
                <option>Plague</option>
                <option>Prejudice</option>
              </optgroup>
              <optgroup label="INFILTRATORS">
                <option>A Betrayer</option>
                <option>A Disease vector</option>
                <option>A Parasite</option>
                <option>A Quarry</option>
                <option>A Revenant</option>
                <option>A Saboteur</option>
              </optgroup>
              <optgroup label="INSTITUTIONS">
                <option>Condemnation & judgement</option>
                <option>Hooks & leverage</option>
                <option>Offices & duties</option>
                <option>Rituals & observances</option>
                <option>Rules & laws</option>
                <option>Status & hierarchy</option>
              </optgroup>
              <optgroup label="LANDSCAPES">
                <option>A Breeding pit</option>
                <option>A Fortress</option>
                <option>A Furnace</option>
                <option>A Maze</option>
                <option>A Mirage</option>
                <option>A Prison</option>
              </optgroup>
              <optgroup label="PINPOINTS">
                <option>A Cradle</option>
                <option>A Doorway</option>
                <option>A Hammer</option>
                <option>A Mirror</option>
                <option>A Searchlight</option>
                <option>A Sickle</option>
              </optgroup>
              <optgroup label="RELIABLES">
                <option>A Confidante</option>
                <option>A Friend</option>
                <option>A Guardian</option>
                <option>A Lover</option>
                <option>A Representative</option>
                <option>A Right hand</option>
              </optgroup>
              <optgroup label="TERRAIN">
                <option>Broken ground</option>
                <option>An Exposed place</option>
                <option>A precipice</option>
                <option>Shifting ground</option>
                <option>A Torrent</option>
                <option>A Wall</option>
              </optgroup>
              <optgroup label="VEHICLES">
                <option>A Bold</option>
                <option>A Cagey</option>
                <option>A Relentless</option>
                <option>A Skittish</option>
                <option>A Vicious</option>
                <option>A Wild</option>
              </optgroup>
              <optgroup label="WARLORDS">
                <option>An Alpha wolf</option>
                <option>A Collector</option>
                <option>A Dictator</option>
                <option>A Hive queen</option>
                <option>A Prophet</option>
                <option>A Slaver</option>
              </optgroup>
            </select>
          </div>
          <div className="pure-controls">
            <button
              onClick={() => send(nextMessage)}
              className="pure-button button-success"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => send(nextMessage)}
              className="pure-button button-warning"
            >
              Close
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
