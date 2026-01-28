import React from 'react';
import { SuratRasmiContent, CompanyInfo } from '../../types';

interface SuratRasmiPreviewProps {
    surat: SuratRasmiContent;
    companyInfo: CompanyInfo;
}

const SuratRasmiPreview: React.FC<SuratRasmiPreviewProps> = ({ surat, companyInfo }) => {
    
    const letterStyle: React.CSSProperties = {
        fontFamily: "'Times New Roman', Times, serif",
        backgroundColor: 'white',
        color: '#000',
        padding: '2.5cm',
        width: '21cm',
        minHeight: '29.7cm',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        margin: '0 auto',
        fontSize: '12pt',
        lineHeight: 1.5,
    };
    
    return (
        <div style={letterStyle}>
            {/* Header */}
            <div style={{ textAlign: 'right', marginBottom: '1cm' }}>
                <p style={{ fontWeight: 'bold', fontSize: '14pt', margin: 0 }}>{companyInfo.name}</p>
                <p style={{ margin: 0 }}>{companyInfo.address}</p>
                <p style={{ margin: 0 }}>Tel: {companyInfo.tel} | Emel: {companyInfo.email}</p>
            </div>

            <div style={{ borderBottom: '2px solid black', marginBottom: '0.5cm' }}></div>

            {/* Rujukan & Tarikh */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1cm' }}>
                <span>Ruj. Kami: {surat.rujukanKami}</span>
                <span>Tarikh: {surat.tarikh}</span>
            </div>

            {/* Penerima */}
            <div style={{ marginBottom: '1cm' }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{surat.penerima.nama}</p>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{surat.penerima.jawatan}</p>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{surat.penerima.institusi}</p>
                <div style={{ whiteSpace: 'pre-line' }}>{surat.penerima.alamat}</div>
            </div>
            
            <p style={{ margin: 0 }}>Tuan/Puan,</p>

            {/* Tajuk */}
            <p style={{ fontWeight: 'bold', textTransform: 'uppercase', textDecoration: 'underline', marginTop: '0.5cm', marginBottom: '1cm' }}>
                {surat.tajuk}
            </p>

            {/* Isi Kandungan */}
            {surat.isiKandungan.map((p, index) => (
                <p key={index} style={{ textIndent: '1cm', textAlign: 'justify', margin: '0 0 0.5cm 0' }}>{p}</p>
            ))}

            <p style={{ textAlign: 'justify', margin: '0 0 0.5cm 0' }}>Sekian, terima kasih.</p>

            {/* Penutup */}
            <div style={{ marginTop: '1cm' }}>
                {surat.penutup.map((p, index) => <p key={index} style={{ margin: 0 }}>{p}</p>)}
                <div style={{ height: '1.5cm' }}></div>
                <p style={{ margin: 0, fontWeight: 'bold' }}>({surat.tandatangan.nama.toUpperCase()})</p>
                <p style={{ margin: 0 }}>{surat.tandatangan.jawatan}</p>
                <p style={{ margin: 0 }}>{companyInfo.name}</p>
            </div>
        </div>
    );
};

export default SuratRasmiPreview;