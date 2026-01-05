/**
 * PowerPoint Export Utility - PREMIUM EDITION
 * Creates professional, visually stunning presentations with modern layouts
 * Inspired by Canva, Google Slides Premium, and professional presentation design
 */

const PptxGenJS = require('pptxgenjs');

/**
 * Premium Color Themes with Gradients and Professional Palettes
 */
const THEMES = {
    professional: {
        name: 'Professional',
        background: { type: 'gradient', colors: ['F8FAFC', 'E2E8F0'] },
        titleColor: '1E293B',
        textColor: '475569',
        accentColor: '3B82F6',
        bulletColor: '3B82F6',
        overlayColor: '0F172A',
        overlayOpacity: 0.7,
        secondaryAccent: '60A5FA'
    },
    dark: {
        name: 'Dark Mode Pro',
        background: { type: 'gradient', colors: ['0F0F23', '1A1A3E'] },
        titleColor: 'FFFFFF',
        textColor: 'CBD5E1',
        accentColor: '06B6D4',
        bulletColor: '22D3EE',
        overlayColor: '000000',
        overlayOpacity: 0.6,
        secondaryAccent: '67E8F9'
    },
    modern: {
        name: 'Modern Minimal',
        background: { type: 'gradient', colors: ['FAFAFA', 'F5F5F5'] },
        titleColor: '18181B',
        textColor: '52525B',
        accentColor: '7C3AED',
        bulletColor: '8B5CF6',
        overlayColor: '1E1B4B',
        overlayOpacity: 0.75,
        secondaryAccent: 'A78BFA'
    },
    nature: {
        name: 'Nature Fresh',
        background: { type: 'gradient', colors: ['ECFDF5', 'D1FAE5'] },
        titleColor: '064E3B',
        textColor: '047857',
        accentColor: '10B981',
        bulletColor: '34D399',
        overlayColor: '022C22',
        overlayOpacity: 0.7,
        secondaryAccent: '6EE7B7'
    },
    corporate: {
        name: 'Corporate Elite',
        background: { type: 'gradient', colors: ['F0F9FF', 'E0F2FE'] },
        titleColor: '0C4A6E',
        textColor: '0369A1',
        accentColor: '0284C7',
        bulletColor: '0EA5E9',
        overlayColor: '082F49',
        overlayOpacity: 0.75,
        secondaryAccent: '38BDF8'
    },
    sunset: {
        name: 'Sunset Vibes',
        background: { type: 'gradient', colors: ['FFF7ED', 'FFEDD5'] },
        titleColor: '7C2D12',
        textColor: '9A3412',
        accentColor: 'EA580C',
        bulletColor: 'F97316',
        overlayColor: '431407',
        overlayOpacity: 0.7,
        secondaryAccent: 'FB923C'
    },
    royal: {
        name: 'Royal Purple',
        background: { type: 'gradient', colors: ['FAF5FF', 'F3E8FF'] },
        titleColor: '581C87',
        textColor: '7E22CE',
        accentColor: '9333EA',
        bulletColor: 'A855F7',
        overlayColor: '3B0764',
        overlayOpacity: 0.75,
        secondaryAccent: 'C084FC'
    }
};

/**
 * Slide Layout Types for Professional Presentations
 */
const SLIDE_LAYOUTS = {
    TITLE_FULL_IMAGE: 'title-full-image',      // Full background image with dark overlay + centered title
    SPLIT_LEFT_IMAGE: 'split-left-image',       // Large image on left (50-60%), text on right
    SPLIT_RIGHT_IMAGE: 'split-right-image',     // Text on left, large image on right (50-60%)
    FULL_WIDTH_TOP_IMAGE: 'full-width-top',     // Full-width image top (40%), content below
    CONCEPT_IMAGE_DOMINANT: 'concept-dominant', // Image takes 70%, minimal text overlay
    GRADIENT_BACKGROUND: 'gradient-bg',         // Gradient background with icons/bullets
    SUMMARY_CLEAN: 'summary-clean'              // Clean summary with accent shapes
};

/**
 * Download image and convert to base64
 * @param {string} imageUrl - URL of the image
 * @returns {string|null} Base64 encoded image or null
 */
const downloadImageAsBase64 = async (imageUrl) => {
    try {
        const response = await fetch(imageUrl, {
            timeout: 15000,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
        });
        if (!response.ok) return null;
        
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64 = buffer.toString('base64');
        
        // Determine image type from URL or content-type
        const contentType = response.headers.get('content-type') || 'image/jpeg';
        const imageType = contentType.includes('png') ? 'png' : 'jpeg';
        
        return { data: base64, type: imageType };
    } catch (error) {
        console.error('Error downloading image:', error.message);
        return null;
    }
};

/**
 * Determine optimal slide layout based on content and position
 * @param {number} index - Slide index
 * @param {number} totalSlides - Total number of slides
 * @param {Object} slideData - Slide data
 * @returns {string} Layout type
 */
const determineSlideLayout = (index, totalSlides, slideData) => {
    const hasImage = slideData.imageUrl && slideData.imageUrl.length > 0;
    const pointCount = slideData.points?.length || 0;
    
    // Title slide always gets full image treatment
    if (index === 0) {
        return SLIDE_LAYOUTS.TITLE_FULL_IMAGE;
    }
    
    // Last slide (summary/conclusion)
    if (index === totalSlides - 1) {
        return SLIDE_LAYOUTS.SUMMARY_CLEAN;
    }
    
    // Concept slides (few points) - image dominant
    if (hasImage && pointCount <= 3) {
        return SLIDE_LAYOUTS.CONCEPT_IMAGE_DOMINANT;
    }
    
    // Alternate between left and right image layouts for visual variety
    if (hasImage) {
        return index % 2 === 0 ? SLIDE_LAYOUTS.SPLIT_RIGHT_IMAGE : SLIDE_LAYOUTS.SPLIT_LEFT_IMAGE;
    }
    
    // No image - use gradient background
    return SLIDE_LAYOUTS.GRADIENT_BACKGROUND;
};

/**
 * Add gradient background to slide
 * @param {Object} slide - PptxGenJS slide object
 * @param {Object} theme - Theme configuration
 */
const addGradientBackground = (slide, theme) => {
    if (theme.background.type === 'gradient') {
        slide.background = { 
            color: theme.background.colors[0]
        };
        // Add subtle gradient overlay shape
        slide.addShape('rect', {
            x: 0, y: 0, w: '100%', h: '100%',
            fill: { 
                type: 'solid',
                color: theme.background.colors[1],
                transparency: 50
            }
        });
    } else {
        slide.background = { color: theme.background };
    }
};

/**
 * Add decorative accent shapes for modern look
 * @param {Object} slide - PptxGenJS slide object
 * @param {Object} theme - Theme configuration
 * @param {string} position - 'top', 'bottom', 'corner'
 */
const addAccentShapes = (slide, theme, position = 'top') => {
    switch (position) {
        case 'top':
            // Sleek top accent bar
            slide.addShape('rect', {
                x: 0, y: 0, w: '100%', h: 0.06,
                fill: { color: theme.accentColor }
            });
            break;
        case 'bottom':
            // Bottom accent with gradient effect
            slide.addShape('rect', {
                x: 0, y: 7.2, w: '100%', h: 0.3,
                fill: { color: theme.accentColor, transparency: 80 }
            });
            break;
        case 'corner':
            // Modern corner accent
            slide.addShape('rect', {
                x: 0, y: 0, w: 0.15, h: 2,
                fill: { color: theme.accentColor }
            });
            break;
        case 'circle':
            // Decorative circle
            slide.addShape('ellipse', {
                x: 11.5, y: -1, w: 3, h: 3,
                fill: { color: theme.secondaryAccent, transparency: 85 }
            });
            break;
    }
};

/**
 * Generate PowerPoint file from presentation data with premium layouts
 * @param {Object} presentationData - The presentation JSON object
 * @param {string} themeName - Theme name
 * @returns {Buffer} PowerPoint file as buffer
 */
const generatePowerPoint = async (presentationData, themeName = 'professional') => {
    const theme = THEMES[themeName] || THEMES.professional;
    
    // Create new presentation
    const pptx = new PptxGenJS();
    
    // Set presentation properties
    pptx.author = 'AI Presentation Maker - Premium';
    pptx.title = presentationData.title || 'Untitled Presentation';
    pptx.subject = 'Professional Generated Presentation';
    pptx.company = 'AI Presentation Maker';
    
    // Set default slide size (16:9 widescreen)
    pptx.defineLayout({ name: 'CUSTOM', width: 13.33, height: 7.5 });
    pptx.layout = 'CUSTOM';

    const totalSlides = presentationData.slides?.length || 0;

    // ===============================
    // TITLE SLIDE - Full Image Background with Dark Overlay
    // ===============================
    const titleSlide = pptx.addSlide();
    
    // Check if first slide has an image for background
    const firstSlideImage = presentationData.slides?.[0]?.imageUrl;
    let titleImageData = null;
    
    if (firstSlideImage) {
        titleImageData = await downloadImageAsBase64(firstSlideImage);
    }
    
    if (titleImageData) {
        // Full background image
        titleSlide.addImage({
            data: `image/${titleImageData.type};base64,${titleImageData.data}`,
            x: 0, y: 0, w: 13.33, h: 7.5,
            sizing: { type: 'cover', w: 13.33, h: 7.5 }
        });
        
        // Dark gradient overlay for text readability
        titleSlide.addShape('rect', {
            x: 0, y: 0, w: 13.33, h: 7.5,
            fill: { color: theme.overlayColor, transparency: 35 }
        });
        
        // Additional bottom gradient for depth
        titleSlide.addShape('rect', {
            x: 0, y: 4.5, w: 13.33, h: 3,
            fill: { color: '000000', transparency: 60 }
        });
    } else {
        // Gradient background fallback
        addGradientBackground(titleSlide, theme);
        addAccentShapes(titleSlide, theme, 'circle');
    }
    
    // Accent line above title
    titleSlide.addShape('rect', {
        x: 4.67, y: 2.8, w: 4, h: 0.06,
        fill: { color: theme.accentColor }
    });
    
    // Main title - Bold and prominent
    titleSlide.addText(presentationData.title || 'Untitled Presentation', {
        x: 0.8, y: 3.0, w: 11.73, h: 1.5,
        fontSize: 48,
        fontFace: 'Arial',
        color: titleImageData ? 'FFFFFF' : theme.titleColor,
        bold: true,
        align: 'center',
        valign: 'middle',
        shadow: titleImageData ? { type: 'outer', blur: 8, offset: 2, angle: 45, color: '000000', opacity: 0.5 } : null
    });
    
    // Subtitle/date with elegant styling
    titleSlide.addText(`${new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    })}`, {
        x: 0.8, y: 4.8, w: 11.73, h: 0.6,
        fontSize: 18,
        fontFace: 'Arial',
        color: titleImageData ? 'E2E8F0' : theme.textColor,
        align: 'center',
        transparency: 20
    });
    
    // Bottom accent bar
    titleSlide.addShape('rect', {
        x: 0, y: 7.35, w: 13.33, h: 0.15,
        fill: { color: theme.accentColor }
    });

    // ===============================
    // CONTENT SLIDES - Premium Layouts
    // ===============================
    if (presentationData.slides && Array.isArray(presentationData.slides)) {
        for (let index = 0; index < presentationData.slides.length; index++) {
            const slideData = presentationData.slides[index];
            const slide = pptx.addSlide();
            const layout = determineSlideLayout(index, totalSlides, slideData);
            const hasImage = slideData.imageUrl && slideData.imageUrl.length > 0;
            
            // Download image if available
            let imageData = null;
            if (hasImage) {
                imageData = await downloadImageAsBase64(slideData.imageUrl);
            }
            
            // Apply layout based on type
            switch (layout) {
                case SLIDE_LAYOUTS.SPLIT_RIGHT_IMAGE:
                    await createSplitRightImageSlide(slide, slideData, imageData, theme, index);
                    break;
                case SLIDE_LAYOUTS.SPLIT_LEFT_IMAGE:
                    await createSplitLeftImageSlide(slide, slideData, imageData, theme, index);
                    break;
                case SLIDE_LAYOUTS.CONCEPT_IMAGE_DOMINANT:
                    await createConceptDominantSlide(slide, slideData, imageData, theme, index);
                    break;
                case SLIDE_LAYOUTS.SUMMARY_CLEAN:
                    await createSummarySlide(slide, slideData, imageData, theme, index, totalSlides);
                    break;
                case SLIDE_LAYOUTS.GRADIENT_BACKGROUND:
                default:
                    await createGradientBackgroundSlide(slide, slideData, theme, index);
                    break;
            }
            
            // Add slide number (bottom right)
            slide.addText(`${index + 2}`, {
                x: 12.5, y: 7.05, w: 0.6, h: 0.35,
                fontSize: 11,
                color: theme.textColor,
                align: 'right',
                transparency: 40
            });
        }
    }

    // ===============================
    // THANK YOU SLIDE - Clean & Professional
    // ===============================
    const thankYouSlide = pptx.addSlide();
    addGradientBackground(thankYouSlide, theme);
    
    // Decorative circles
    thankYouSlide.addShape('ellipse', {
        x: -2, y: -2, w: 6, h: 6,
        fill: { color: theme.accentColor, transparency: 90 }
    });
    thankYouSlide.addShape('ellipse', {
        x: 10, y: 4, w: 5, h: 5,
        fill: { color: theme.secondaryAccent, transparency: 85 }
    });
    
    // Thank you text
    thankYouSlide.addText('Thank You!', {
        x: 0.8, y: 2.5, w: 11.73, h: 1.5,
        fontSize: 56,
        fontFace: 'Arial',
        color: theme.titleColor,
        bold: true,
        align: 'center',
        valign: 'middle'
    });
    
    // Accent line
    thankYouSlide.addShape('rect', {
        x: 5.17, y: 4.2, w: 3, h: 0.08,
        fill: { color: theme.accentColor }
    });
    
    // Subtitle
    thankYouSlide.addText('Questions & Discussion', {
        x: 0.8, y: 4.5, w: 11.73, h: 0.8,
        fontSize: 24,
        fontFace: 'Arial',
        color: theme.textColor,
        align: 'center'
    });
    
    // Bottom accent
    thankYouSlide.addShape('rect', {
        x: 0, y: 7.35, w: 13.33, h: 0.15,
        fill: { color: theme.accentColor }
    });

    // Generate file as buffer
    const pptxBuffer = await pptx.write({ outputType: 'nodebuffer' });
    return pptxBuffer;
};

/**
 * Create Split Layout - Image on RIGHT (50-60%), Text on LEFT
 */
const createSplitRightImageSlide = async (slide, slideData, imageData, theme, index) => {
    // Background
    slide.background = { color: theme.background.colors ? theme.background.colors[0] : 'FFFFFF' };
    
    // Left side accent bar
    slide.addShape('rect', {
        x: 0, y: 0, w: 0.1, h: 7.5,
        fill: { color: theme.accentColor }
    });
    
    // Title on left side (40% width)
    slide.addText(slideData.slideTitle || `Slide ${index + 1}`, {
        x: 0.5, y: 0.5, w: 5.5, h: 1.0,
        fontSize: 32,
        fontFace: 'Arial',
        color: theme.titleColor,
        bold: true,
        valign: 'middle'
    });
    
    // Accent line under title
    slide.addShape('rect', {
        x: 0.5, y: 1.5, w: 2.5, h: 0.05,
        fill: { color: theme.accentColor }
    });
    
    // Bullet points on left (40% width)
    if (slideData.points && Array.isArray(slideData.points)) {
        const bulletPoints = slideData.points.map(point => ({
            text: point,
            options: {
                bullet: { type: 'bullet', color: theme.bulletColor },
                color: theme.textColor,
                fontSize: 16,
                fontFace: 'Arial',
                breakLine: true,
                paraSpaceAfter: 12,
                indentLevel: 0
            }
        }));
        
        slide.addText(bulletPoints, {
            x: 0.5, y: 1.8, w: 5.5, h: 5.2,
            valign: 'top'
        });
    }
    
    // Large image on right (60% width) - Full height
    if (imageData) {
        slide.addImage({
            data: `image/${imageData.type};base64,${imageData.data}`,
            x: 6.33, y: 0, w: 7, h: 7.5,
            sizing: { type: 'cover', w: 7, h: 7.5 },
            rounding: false // Edge-to-edge, no rounded corners for professional look
        });
        
        // Subtle left gradient fade on image for blend
        slide.addShape('rect', {
            x: 6.33, y: 0, w: 1.5, h: 7.5,
            fill: { 
                type: 'solid', 
                color: theme.background.colors ? theme.background.colors[0] : 'FFFFFF',
                transparency: 70
            }
        });
    }
};

/**
 * Create Split Layout - Image on LEFT (50-60%), Text on RIGHT
 */
const createSplitLeftImageSlide = async (slide, slideData, imageData, theme, index) => {
    // Background
    slide.background = { color: theme.background.colors ? theme.background.colors[0] : 'FFFFFF' };
    
    // Large image on left (60% width) - Full height
    if (imageData) {
        slide.addImage({
            data: `image/${imageData.type};base64,${imageData.data}`,
            x: 0, y: 0, w: 7, h: 7.5,
            sizing: { type: 'cover', w: 7, h: 7.5 }
        });
        
        // Right gradient fade on image for blend
        slide.addShape('rect', {
            x: 5.5, y: 0, w: 1.5, h: 7.5,
            fill: { 
                type: 'solid', 
                color: theme.background.colors ? theme.background.colors[0] : 'FFFFFF',
                transparency: 70
            }
        });
    }
    
    // Right side accent bar
    slide.addShape('rect', {
        x: 13.23, y: 0, w: 0.1, h: 7.5,
        fill: { color: theme.accentColor }
    });
    
    // Title on right side
    slide.addText(slideData.slideTitle || `Slide ${index + 1}`, {
        x: 7.3, y: 0.5, w: 5.5, h: 1.0,
        fontSize: 32,
        fontFace: 'Arial',
        color: theme.titleColor,
        bold: true,
        valign: 'middle'
    });
    
    // Accent line under title
    slide.addShape('rect', {
        x: 7.3, y: 1.5, w: 2.5, h: 0.05,
        fill: { color: theme.accentColor }
    });
    
    // Bullet points on right
    if (slideData.points && Array.isArray(slideData.points)) {
        const bulletPoints = slideData.points.map(point => ({
            text: point,
            options: {
                bullet: { type: 'bullet', color: theme.bulletColor },
                color: theme.textColor,
                fontSize: 16,
                fontFace: 'Arial',
                breakLine: true,
                paraSpaceAfter: 12,
                indentLevel: 0
            }
        }));
        
        slide.addText(bulletPoints, {
            x: 7.3, y: 1.8, w: 5.5, h: 5.2,
            valign: 'top'
        });
    }
};

/**
 * Create Concept-Dominant Slide - Image takes 70%, minimal text
 */
const createConceptDominantSlide = async (slide, slideData, imageData, theme, index) => {
    if (imageData) {
        // Full background image
        slide.addImage({
            data: `image/${imageData.type};base64,${imageData.data}`,
            x: 0, y: 0, w: 13.33, h: 7.5,
            sizing: { type: 'cover', w: 13.33, h: 7.5 }
        });
        
        // Dark overlay on bottom for text
        slide.addShape('rect', {
            x: 0, y: 4.5, w: 13.33, h: 3,
            fill: { color: theme.overlayColor, transparency: 25 }
        });
        
        // Gradient from transparent to dark at bottom
        slide.addShape('rect', {
            x: 0, y: 0, w: 13.33, h: 7.5,
            fill: { color: '000000', transparency: 70 }
        });
    } else {
        addGradientBackground(slide, theme);
    }
    
    // Title - Large and bold at bottom
    slide.addText(slideData.slideTitle || `Slide ${index + 1}`, {
        x: 0.8, y: 4.8, w: 11.73, h: 1.2,
        fontSize: 40,
        fontFace: 'Arial',
        color: imageData ? 'FFFFFF' : theme.titleColor,
        bold: true,
        valign: 'middle',
        shadow: imageData ? { type: 'outer', blur: 6, offset: 2, angle: 45, color: '000000', opacity: 0.4 } : null
    });
    
    // Minimal bullet points (if any)
    if (slideData.points && slideData.points.length > 0) {
        const shortPoints = slideData.points.slice(0, 3).map(point => ({
            text: `• ${point}`,
            options: {
                color: imageData ? 'E2E8F0' : theme.textColor,
                fontSize: 16,
                fontFace: 'Arial',
                breakLine: true,
                paraSpaceAfter: 8
            }
        }));
        
        slide.addText(shortPoints, {
            x: 0.8, y: 6.0, w: 11.73, h: 1.3,
            valign: 'top',
            shadow: imageData ? { type: 'outer', blur: 4, offset: 1, angle: 45, color: '000000', opacity: 0.3 } : null
        });
    }
    
    // Accent line
    slide.addShape('rect', {
        x: 0.8, y: 4.6, w: 3, h: 0.06,
        fill: { color: theme.accentColor }
    });
};

/**
 * Create Summary/Conclusion Slide - Clean with gradient
 */
const createSummarySlide = async (slide, slideData, imageData, theme, index, totalSlides) => {
    addGradientBackground(slide, theme);
    
    // Decorative shape
    slide.addShape('ellipse', {
        x: 10, y: -1.5, w: 5, h: 5,
        fill: { color: theme.accentColor, transparency: 90 }
    });
    
    // Left accent bar
    slide.addShape('rect', {
        x: 0, y: 0, w: 0.12, h: 7.5,
        fill: { color: theme.accentColor }
    });
    
    // Title
    slide.addText(slideData.slideTitle || 'Summary', {
        x: 0.6, y: 0.4, w: 12, h: 1.2,
        fontSize: 36,
        fontFace: 'Arial',
        color: theme.titleColor,
        bold: true,
        valign: 'middle'
    });
    
    // Accent line
    slide.addShape('rect', {
        x: 0.6, y: 1.5, w: 3, h: 0.06,
        fill: { color: theme.accentColor }
    });
    
    // Content with nice formatting
    if (slideData.points && Array.isArray(slideData.points)) {
        const bulletPoints = slideData.points.map((point, i) => ({
            text: point,
            options: {
                bullet: { 
                    type: 'number',
                    color: theme.bulletColor,
                    style: 'arabicPeriod'
                },
                color: theme.textColor,
                fontSize: 18,
                fontFace: 'Arial',
                breakLine: true,
                paraSpaceAfter: 16,
                indentLevel: 0
            }
        }));
        
        slide.addText(bulletPoints, {
            x: 0.6, y: 1.9, w: 12, h: 5.0,
            valign: 'top'
        });
    }
    
    // Bottom accent
    slide.addShape('rect', {
        x: 0, y: 7.35, w: 13.33, h: 0.15,
        fill: { color: theme.accentColor }
    });
};

/**
 * Create Gradient Background Slide (no image)
 */
const createGradientBackgroundSlide = async (slide, slideData, theme, index) => {
    addGradientBackground(slide, theme);
    
    // Top accent bar
    slide.addShape('rect', {
        x: 0, y: 0, w: 13.33, h: 0.08,
        fill: { color: theme.accentColor }
    });
    
    // Decorative circle
    slide.addShape('ellipse', {
        x: 10.5, y: -1, w: 4, h: 4,
        fill: { color: theme.secondaryAccent, transparency: 88 }
    });
    
    // Title
    slide.addText(slideData.slideTitle || `Slide ${index + 1}`, {
        x: 0.5, y: 0.5, w: 12.33, h: 1.0,
        fontSize: 34,
        fontFace: 'Arial',
        color: theme.titleColor,
        bold: true,
        valign: 'middle'
    });
    
    // Accent line
    slide.addShape('rect', {
        x: 0.5, y: 1.5, w: 2.5, h: 0.05,
        fill: { color: theme.accentColor }
    });
    
    // Full-width bullet points
    if (slideData.points && Array.isArray(slideData.points)) {
        const bulletPoints = slideData.points.map(point => ({
            text: point,
            options: {
                bullet: { type: 'bullet', color: theme.bulletColor },
                color: theme.textColor,
                fontSize: 18,
                fontFace: 'Arial',
                breakLine: true,
                paraSpaceAfter: 14,
                indentLevel: 0
            }
        }));
        
        slide.addText(bulletPoints, {
            x: 0.5, y: 1.8, w: 12.33, h: 5.2,
            valign: 'top'
        });
    }
    
    // Bottom accent
    slide.addShape('rect', {
        x: 0, y: 7.35, w: 13.33, h: 0.15,
        fill: { color: theme.accentColor }
    });
};

/**
 * Get available themes with descriptions
 * @returns {Array} List of available theme names with details
 */
const getAvailableThemes = () => {
    return Object.keys(THEMES).map(key => ({
        id: key,
        name: THEMES[key].name || key.charAt(0).toUpperCase() + key.slice(1),
        colors: {
            primary: THEMES[key].accentColor,
            secondary: THEMES[key].secondaryAccent,
            title: THEMES[key].titleColor,
            text: THEMES[key].textColor
        },
        preview: `${THEMES[key].background.colors ? THEMES[key].background.colors[0] : THEMES[key].background}`
    }));
};

/**
 * Get available slide layouts
 * @returns {Object} Layout types and descriptions
 */
const getAvailableLayouts = () => {
    return {
        layouts: SLIDE_LAYOUTS,
        descriptions: {
            [SLIDE_LAYOUTS.TITLE_FULL_IMAGE]: 'Full background image with dark overlay and centered title',
            [SLIDE_LAYOUTS.SPLIT_LEFT_IMAGE]: 'Large image on left (50-60%), text content on right',
            [SLIDE_LAYOUTS.SPLIT_RIGHT_IMAGE]: 'Text content on left, large image on right (50-60%)',
            [SLIDE_LAYOUTS.FULL_WIDTH_TOP_IMAGE]: 'Full-width image at top, content below',
            [SLIDE_LAYOUTS.CONCEPT_IMAGE_DOMINANT]: 'Image-dominant (70%) with minimal text overlay',
            [SLIDE_LAYOUTS.GRADIENT_BACKGROUND]: 'Gradient background with decorative shapes',
            [SLIDE_LAYOUTS.SUMMARY_CLEAN]: 'Clean summary with numbered points and accents'
        }
    };
};

module.exports = {
    generatePowerPoint,
    getAvailableThemes,
    getAvailableLayouts,
    downloadImageAsBase64,
    THEMES,
    SLIDE_LAYOUTS
};
