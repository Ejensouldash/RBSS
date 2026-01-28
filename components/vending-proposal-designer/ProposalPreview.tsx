import React from 'react';
import { GeneratedSlide, CompanyInfo, ColorTheme } from '../../types';

interface ProposalPreviewProps {
    slideData: GeneratedSlide;
    imageBase64?: string;
    companyInfo: CompanyInfo;
    colorTheme: ColorTheme;
}

const THEMES = {
    'Korporat (RBE)': {
        primary: '#D2042D',
        secondary: '#FFD700',
        text: '#333333',
        background: '#FFFFFF',
        headerText: '#FFFFFF',
    },
    'Elegan (Emas & Hitam)': {
        primary: '#FFD700',
        secondary: '#333333',
        text: '#E5E7EB',
        background: '#111827',
        headerText: '#111827',
    },
    'Moden & Minimalis': {
        primary: '#374151',
        secondary: '#9CA3AF',
        text: '#1F2937',
        background: '#FFFFFF',
        headerText: '#FFFFFF'
    }
};

const cleanText = (text: string): string => {
    if (typeof text !== 'string') return '';
    // This regex now correctly finds the emoji and the text after it, to wrap the text in a span.
    const parts = text.split(/^(✅\s*\*?)/);
    if (parts.length === 3) {
        const strongText = parts[2].split(/\*?:\s*/);
        if (strongText.length > 1) {
             return `✅ <strong>${strongText[0]}:</strong> ${strongText.slice(1).join(': ')}`;
        }
        return `✅ ${parts[2]}`;
    }
    return text;
};


const ProposalPreview: React.FC<ProposalPreviewProps> = ({ slideData, imageBase64, companyInfo, colorTheme }) => {
    
    const theme = THEMES[colorTheme] || THEMES['Korporat (RBE)'];

    const slideBaseStyle: React.CSSProperties = {
        fontFamily: "'Inter', sans-serif",
        width: '100%',
        aspectRatio: '16 / 9',
        position: 'relative',
        display: 'flex',
        overflow: 'hidden',
        backgroundColor: theme.background,
        border: '1px solid #ddd'
    };
    
    const watermarkStyle: React.CSSProperties = {
        position: 'absolute',
        bottom: '1.5rem',
        right: '1.5rem',
        width: '80px',
        height: 'auto',
        opacity: 0.4,
        filter: theme.background !== '#FFFFFF' ? 'brightness(0) invert(1)' : ''
    };

    switch (slideData.slideNumber) {
        case 1:
            return (
                <section style={{...slideBaseStyle, backgroundImage: imageBase64 ? `url(data:image/jpeg;base64,${imageBase64})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', color: 'white' }}>
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0.2) 100%)', padding: '3rem' }}>
                         {companyInfo.logo && <img src={companyInfo.logo} alt="Logo" style={{ width: '120px', height: 'auto', opacity: 0.9 }} />}
                        <div style={{ position: 'absolute', bottom: '3rem', maxWidth: '60%' }}>
                            <h1 style={{ fontSize: '3rem', fontWeight: 800, lineHeight: 1.1, textShadow: '2px 2px 4px rgba(0,0,0,0.7)' }}>{slideData.title}</h1>
                            <p style={{ fontSize: '1.5rem', color: theme.primary, marginTop: '0.5rem', fontWeight: 600, borderLeft: `4px solid ${theme.primary}`, paddingLeft: '1rem' }}>{slideData.subtitle}</p>
                        </div>
                    </div>
                </section>
            );

        case 9:
             return (
                <section style={{...slideBaseStyle, flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', padding: '3rem' }}>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: theme.primary }}>{slideData.title}</h2>
                    <p style={{ fontSize: '1.1rem', color: theme.text, marginTop: '1.5rem', maxWidth: '70%', lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: cleanText(slideData.contentPoints[0] || '') }}></p>
                    <div style={{ marginTop: '3rem', borderTop: `2px solid ${theme.secondary}`, paddingTop: '1.5rem', width: '70%'}}>
                        <p style={{ fontSize: '1rem', color: theme.text }}><strong>Langkah Seterusnya:</strong> <span dangerouslySetInnerHTML={{ __html: cleanText(slideData.contentPoints[1] || '') }}></span></p>
                        <p style={{ fontSize: '1rem', color: theme.text, marginTop: '1rem' }}><strong>Hubungi Kami:</strong> <span dangerouslySetInnerHTML={{ __html: cleanText(slideData.contentPoints[2] || '') }}></span></p>
                    </div>
                    {companyInfo.logo && <img src={companyInfo.logo} alt="Watermark" style={watermarkStyle} />}
                </section>
            );

        default:
            const isReversed = [3, 5, 7].includes(slideData.slideNumber);
            return (
                <section style={{ ...slideBaseStyle, padding: '0', alignItems: 'center', gap: '0', flexDirection: isReversed ? 'row-reverse' : 'row' }}>
                    <div style={{ flex: 1.1, padding: '3rem', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                         <h2 style={{ fontSize: '2.2rem', fontWeight: 800, color: theme.primary, lineHeight: 1.2, marginBottom: '2rem' }}>{slideData.title}</h2>
                        <ul style={{ listStyle: 'none', padding: 0, fontSize: '1rem', color: theme.text, lineHeight: 1.8 }}>
                            {slideData.contentPoints.map((point, i) => <li key={i} style={{ marginBottom: '1rem', display: 'flex', alignItems: 'flex-start' }} dangerouslySetInnerHTML={{ __html: cleanText(point) }}></li>)}
                        </ul>
                    </div>
                    {imageBase64 && (
                        <div style={{ flex: 0.9, height: '100%', overflow: 'hidden' }}>
                            <img src={`data:image/jpeg;base64,${imageBase64}`} alt={slideData.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        </div>
                    )}
                     {companyInfo.logo && <img src={companyInfo.logo} alt="Watermark" style={watermarkStyle} />}
                </section>
            );
    }
};

export default ProposalPreview;
