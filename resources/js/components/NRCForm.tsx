import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useEffect, useState } from 'react';
import { nrcdata } from './nrcdata';
const NRCForm: React.FC<any> = ({
    NRCCodeSelect = '1',
    setNRCCodeSelect,
    NRCPlaceSelect,
    setNRCPlaceSelect,
    NRCTypeSelect,
    setNRCTypeSelect,
    NRCCode,
    setNRCCode,
    language = 'all',
    onUpdate,
}) => {
    const nrcode = [
        { en: '1', mm: '၁' },
        { en: '2', mm: '၂' },
        { en: '3', mm: '၃' },
        { en: '4', mm: '၄' },
        { en: '5', mm: '၅' },
        { en: '6', mm: '၆' },
        { en: '7', mm: '၇' },
        { en: '8', mm: '၈' },
        { en: '9', mm: '၉' },
        { en: '10', mm: '၁၀' },
        { en: '11', mm: '၁၁' },
        { en: '12', mm: '၁၂' },
        { en: '13', mm: '၁၃' },
        { en: '14', mm: '၁၄' },
    ];

    const nrcType = [
        { en: 'N', mm: 'နိုင်' },
        { en: 'E', mm: 'ဧည့်' },
        { en: 'P', mm: 'ပြု' },
        { en: 'T', mm: 'သာသနာ' },
        { en: 'R', mm: 'ယာယီ' },
        { en: 'S', mm: 'စ' },
    ];

    const [placen, setPlacen] = useState<any[]>([]);

    useEffect(() => {
        const data = nrcdata;
        if (!data.length) return;

        const result = data.filter((item) => item.nrc_code === NRCCodeSelect);
        setPlacen(result);
        setNRCPlaceSelect(result.length ? result[0].name_en : '');
    }, [NRCCodeSelect, NRCTypeSelect]);

    useEffect(() => {
        onUpdate(`${NRCCodeSelect}/${NRCPlaceSelect}(${NRCTypeSelect})${NRCCode}`);
    }, [NRCCode, NRCCodeSelect, NRCPlaceSelect, NRCTypeSelect]);

    useEffect(() => {
        setNRCCodeSelect(nrcode[0].en);
        setNRCTypeSelect(nrcType[0].en);
    }, []);

    return (
        <div className="flex w-full flex-wrap gap-2">
            {/* NRC Code */}
            <Select value={NRCCodeSelect} onValueChange={setNRCCodeSelect}>
                <SelectTrigger className="w-[110px]">
                    <SelectValue placeholder="Code" />
                </SelectTrigger>
                <SelectContent>
                    {nrcode.map((item, index) => (
                        <SelectItem key={index} value={item.en}>
                            {language === 'mm' ? item.mm : language === 'en' ? item.en : `${item.en} - ${item.mm}`}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={NRCPlaceSelect} onValueChange={setNRCPlaceSelect}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Place" />
                </SelectTrigger>
                <SelectContent>
                    {placen.map((item, index) => (
                        <SelectItem key={index} value={item.name_en}>
                            {language === 'mm' ? item.name_mm : language === 'en' ? item.name_en : `${item.name_en} - ${item.name_mm}`}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Select value={NRCTypeSelect} onValueChange={setNRCTypeSelect}>
                <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                    {nrcType.map((item, index) => (
                        <SelectItem key={index} value={item.en}>
                            {language === 'mm' ? item.mm : language === 'en' ? item.en : `${item.en} - ${item.mm}`}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            <Input
                type="number"
                placeholder="xxxxxx"
                value={NRCCode}
                onChange={(e) => {
                    if (e.target.value.length <= 6) {
                        setNRCCode(e.target.value);
                    }
                }}
                className="w-[140px]"
            />
        </div>
    );
};

export default NRCForm;
