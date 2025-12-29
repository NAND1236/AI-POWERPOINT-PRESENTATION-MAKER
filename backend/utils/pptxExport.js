/**
 * PowerPoint Export Utility
 * Converts presentation JSON to downloadable .pptx file
 */

const PptxGenJS = require('pptxgenjs');

/**
 * Color themes for presentations
 */
const THEMES = {
    professional: {
        background: 'FFFFFF',
        titleColor: '2C3E50',
        textColor: '34495E',
        accentColor: '3498DB',
        bulletColor: '3498DB'
    },
    dark: {
        background: '1A1A2E',
        titleColor: 'FFFFFF',
        textColor: 'E8E8E8',
        accentColor: '00D9FF',
        bulletColor: '00D9FF'
    },
    modern: {
        background: 'F8F9FA',
        titleColor: '212529',
        textColor: '495057',
        accentColor: '6C63FF',
        bulletColor: '6C63FF'
    },
    nature: {
        background: 'F0FFF0',
        titleColor: '2D5016',
        textColor: '3D6B24',
        accentColor: '4CAF50',
        bulletColor: '4CAF50'
    },
    corporate: {
        background: 'FFFFFF',
        titleColor: '1E3A5F',
        textColor: '2C4A6E',
        accentColor: '0066CC',
        bulletColor: '0066CC'
    }
};

/**
 * Generate PowerPoint file from presentation data
 * @param {Object} presentationData - The presentation JSON object
 * @param {string} themeName - Theme name (professional, dark, modern, nature, corporate)
 * @returns {Buffer} PowerPoint file as buffer
 */
const generatePowerPoint = async (presentationData, themeName = 'professional') => {
    const theme = THEMES[themeName] || THEMES.professional;
    
    // Create new presentation
    const pptx = new PptxGenJS();
    
    // Set presentation properties
    pptx.author = 'AI Presentation Maker';
    pptx.title = presentationData.title || 'Untitled Presentation';
    pptx.subject = 'Generated Presentation';
    pptx.company = 'AI Presentation Maker';
    
    // Set default slide size (16:9 widescreen)
    pptx.defineLayout({ name: 'CUSTOM', width: 13.33, height: 7.5 });
    pptx.layout = 'CUSTOM';

    // Create title slide
    const titleSlide = pptx.addSlide();
    titleSlide.background = { color: theme.background };
    
    // Add decorative accent bar
    titleSlide.addShape('rect', {
        x: 0,
        y: 3.2,
        w: 13.33,
        h: 0.1,
        fill: { color: theme.accentColor }
    });
    
    // Add title
    titleSlide.addText(presentationData.title || 'Untitled Presentation', {
        x: 0.5,
        y: 2.5,
        w: 12.33,
        h: 1.5,
        fontSize: 44,
        fontFace: 'Arial',
        color: theme.titleColor,
        bold: true,
        align: 'center',
        valign: 'middle'
    });
    
    // Add subtitle/date
    titleSlide.addText(`Generated on ${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    })}`, {
        x: 0.5,
        y: 4.5,
        w: 12.33,
        h: 0.5,
        fontSize: 18,
        fontFace: 'Arial',
        color: theme.textColor,
        align: 'center'
    });

    // Create content slides
    if (presentationData.slides && Array.isArray(presentationData.slides)) {
        presentationData.slides.forEach((slideData, index) => {
            const slide = pptx.addSlide();
            slide.background = { color: theme.background };
            
            // Add slide number
            slide.addText(`${index + 2}`, {
                x: 12.5,
                y: 7,
                w: 0.5,
                h: 0.3,
                fontSize: 10,
                color: theme.textColor,
                align: 'right'
            });
            
            // Add accent bar at top
            slide.addShape('rect', {
                x: 0,
                y: 0,
                w: 13.33,
                h: 0.08,
                fill: { color: theme.accentColor }
            });
            
            // Add slide title
            slide.addText(slideData.slideTitle || `Slide ${index + 1}`, {
                x: 0.5,
                y: 0.4,
                w: 12.33,
                h: 0.8,
                fontSize: 32,
                fontFace: 'Arial',
                color: theme.titleColor,
                bold: true,
                valign: 'middle'
            });
            
            // Add horizontal line under title
            slide.addShape('rect', {
                x: 0.5,
                y: 1.3,
                w: 2,
                h: 0.04,
                fill: { color: theme.accentColor }
            });
            
            // Add bullet points
            if (slideData.points && Array.isArray(slideData.points)) {
                const bulletPoints = slideData.points.map(point => ({
                    text: point,
                    options: {
                        bullet: { 
                            type: 'bullet',
                            color: theme.bulletColor
                        },
                        color: theme.textColor,
                        fontSize: 18,
                        fontFace: 'Arial',
                        breakLine: true,
                        paraSpaceAfter: 12,
                        indentLevel: 0
                    }
                }));
                
                slide.addText(bulletPoints, {
                    x: 0.5,
                    y: 1.6,
                    w: 12.33,
                    h: 5.4,
                    valign: 'top',
                    paraSpaceBefore: 6,
                    paraSpaceAfter: 6
                });
            }
        });
    }

    // Add thank you slide
    const thankYouSlide = pptx.addSlide();
    thankYouSlide.background = { color: theme.background };
    
    // Add decorative accent
    thankYouSlide.addShape('rect', {
        x: 5.5,
        y: 4,
        w: 2.33,
        h: 0.08,
        fill: { color: theme.accentColor }
    });
    
    thankYouSlide.addText('Thank You!', {
        x: 0.5,
        y: 2.8,
        w: 12.33,
        h: 1.2,
        fontSize: 48,
        fontFace: 'Arial',
        color: theme.titleColor,
        bold: true,
        align: 'center',
        valign: 'middle'
    });
    
    thankYouSlide.addText('Questions & Discussion', {
        x: 0.5,
        y: 4.3,
        w: 12.33,
        h: 0.6,
        fontSize: 24,
        fontFace: 'Arial',
        color: theme.textColor,
        align: 'center'
    });

    // Generate file as buffer
    const pptxBuffer = await pptx.write({ outputType: 'nodebuffer' });
    return pptxBuffer;
};

/**
 * Get available themes
 * @returns {Array} List of available theme names
 */
const getAvailableThemes = () => {
    return Object.keys(THEMES).map(key => ({
        id: key,
        name: key.charAt(0).toUpperCase() + key.slice(1),
        colors: THEMES[key]
    }));
};

module.exports = {
    generatePowerPoint,
    getAvailableThemes,
    THEMES
};
