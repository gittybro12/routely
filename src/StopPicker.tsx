import { Autocomplete, TextField } from '@mui/material';
import { carParks, searchParks } from './data';
import type { CarPark } from './types';

export default function StopPicker({ id, value, label, onSelect }: {
  id: string;
  value: CarPark | undefined;
  label: string;
  onSelect: (id: string) => void;
}) {
  return <Autocomplete
    id={id}
    options={carParks}
    value={value || null}
    getOptionLabel={(park) => park.name}
    isOptionEqualToValue={(a, b) => a.id === b.id}
    filterOptions={(options, state) => searchParks(state.inputValue, options)}
    onChange={(_, park) => onSelect(park?.id || '')}
    autoHighlight
    clearOnEscape
    noOptionsText="No mapped stops found. Try another area or stop name."
    renderOption={({ key, ...props }, park) => <li key={key} {...props}><span className="journey-stop-option"><strong>{park.name}</strong><small>{park.zone} · Sample stop</small></span></li>}
    renderInput={(params) => <TextField {...params} label={label} placeholder="Search a stop, area or nickname" size="small" />}
  />;
}
