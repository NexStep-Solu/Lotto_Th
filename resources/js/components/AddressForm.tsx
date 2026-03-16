import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect } from 'react';
import { addressdata } from './addressdata';

interface AddressFormProps {
    region: string;
    setRegion: (v: string) => void;
    district: string;
    setDistrict: (v: string) => void;
    township: string;
    setTownship: (v: string) => void;
    onUpdate?: (fullAddress: string) => void;
}

const AddressForm: React.FC<AddressFormProps> = ({ region, setRegion, district, setDistrict, township, setTownship, onUpdate }) => {
    const data = addressdata[0];

    const regions = Object.keys(data);
    const districts = region ? Object.keys(data[region] || {}) : [];
    const townships = region && district ? data[region][district] || [] : [];

    // Reset cascade
    useEffect(() => {
        if (region) {
            setDistrict('');
            setTownship('');
        }
    }, [region]);

    useEffect(() => {
        if (district) {
            setTownship('');
        }
    }, [district]);

    useEffect(() => {
        if (onUpdate) {
            onUpdate([township, district, region].filter(Boolean).join(', '));
        }
    }, [region, district, township]);

    return (
        <div className="flex w-full flex-wrap gap-2">
            {/* Region */}
            <Select value={region} onValueChange={setRegion}>
                <SelectTrigger className="w-[220px]">
                    <SelectValue placeholder="Select Region / State" />
                </SelectTrigger>
                <SelectContent>
                    {regions.map((r) => (
                        <SelectItem key={r} value={r}>
                            {r}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* District */}
            <Select value={district} onValueChange={setDistrict} disabled={!region}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select District" />
                </SelectTrigger>
                <SelectContent>
                    {districts.map((d) => (
                        <SelectItem key={d} value={d}>
                            {d}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Township */}
            <Select value={township} onValueChange={setTownship} disabled={!district}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select Township" />
                </SelectTrigger>
                <SelectContent>
                    {townships.map((t: string) => (
                        <SelectItem key={t} value={t}>
                            {t}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>
    );
};

export default AddressForm;
