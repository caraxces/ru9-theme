document.addEventListener('DOMContentLoaded', () => {
    const MAX_WIDGET_ATTEMPTS = 20;
    let widgetAttempts = 0;
    console.log('🚀 Judge.me Custom Layout Script Activated. Waiting for widget...');

    const enhanceLayout = () => {
        const widgetHeader = document.querySelector('.jdgm-rev-widg__header');
        if (!widgetHeader || widgetHeader.classList.contains('js-layout-enhanced')) {
            return;
        }

        console.log('✅ Widget header found. Restructuring layout...');
        
        // --- Elements ---
        const summary = widgetHeader.querySelector('.jdgm-rev-widg__summary');
        const histogram = widgetHeader.querySelector('.jdgm-histogram');
        const writeReviewLink = widgetHeader.querySelector('.jdgm-write-rev-link');
        const actionsWrapper = widgetHeader.querySelector('.jdgm-widget-actions-wrapper');

        if (!summary || !histogram || !writeReviewLink || !actionsWrapper) {
            console.warn('Could not find all necessary elements for restructuring.');
            return;
        }

        // --- 1. Restructure DOM for Stable Left Column ---
        const leftColumn = document.createElement('div');
        leftColumn.className = 'jdgm-custom-left-column';
        
        leftColumn.appendChild(summary);
        leftColumn.appendChild(writeReviewLink);
        leftColumn.appendChild(histogram);

        widgetHeader.appendChild(leftColumn);
        widgetHeader.appendChild(actionsWrapper);
        widgetHeader.classList.add('js-layout-enhanced');
        console.log('✅ Left column restructured.');

        // --- 2. Continuously Poll for Media ---
        let pollAttempts = 0;
        const MAX_POLL_ATTEMPTS = 15; // Poll for 15 seconds
        const uniqueSources = new Set();
        let carouselBuilt = false;

        const mediaPoller = setInterval(() => {
            pollAttempts++;
            const reviews = document.querySelectorAll('.jdgm-rev');
            const newlyFoundMedia = [];

            reviews.forEach((review) => {
                // Find images and upgrade to higher quality
                review.querySelectorAll('.jdgm-rev__pic-img').forEach(img => {
                    if (img.src && !uniqueSources.has(img.src)) {
                        // Upgrade image quality by replacing size parameters
                        let highQualitySrc = img.src;
                        
                        // Replace common Shopify image size patterns with larger sizes
                        highQualitySrc = highQualitySrc
                            .replace(/_(pico|icon|thumb|small|compact|medium)\./g, '_large.')
                            .replace(/_(100x100|150x150|200x200|240x240)\./g, '_600x600.')
                            .replace(/\?.*$/, ''); // Remove query params that might limit quality
                        
                        // Add quality parameters for Shopify CDN
                        if (highQualitySrc.includes('cdn.shopify.com')) {
                            highQualitySrc += '?quality=100';
                        }
                        
                        uniqueSources.add(img.src);
                        newlyFoundMedia.push({ type: 'image', src: highQualitySrc });
                    }
                });
                // Find videos
                review.querySelectorAll('video').forEach(video => {
                    const source = video.querySelector('source')?.src || video.src;
                    if (source && !uniqueSources.has(source)) {
                        uniqueSources.add(source);
                        newlyFoundMedia.push({ type: 'video', src: source });
                    }
                });
            });

            if (newlyFoundMedia.length > 0) {
                const mediaContainer = actionsWrapper.querySelector('.jdgm-custom-image-carousel') || document.createElement('div');
                if (!carouselBuilt) {
                    mediaContainer.className = 'jdgm-custom-image-carousel';
                    carouselBuilt = true;
                }

                newlyFoundMedia.forEach((item, index) => {
                    if (item.type === 'image') {
                        const img = document.createElement('img');
                        img.src = item.src;
                        
                        // Eager load first 3 images, lazy load rest
                        img.loading = index < 3 ? 'eager' : 'lazy';
                        
                        // Add decoding hint for better performance
                        img.decoding = 'async';
                        
                        // Add fetchpriority for first image
                        if (index === 0) {
                            img.fetchPriority = 'high';
                        }
                        
                        // Set explicit dimensions to prevent layout shift
                        img.width = 300;
                        img.height = 300;
                        
                        // Add srcset for responsive images (if Shopify CDN)
                        if (item.src.includes('cdn.shopify.com')) {
                            const baseUrl = item.src.split('?')[0];
                            img.srcset = `
                                ${baseUrl}?width=300&quality=100 300w,
                                ${baseUrl}?width=600&quality=100 600w,
                                ${baseUrl}?width=900&quality=100 900w
                            `;
                            img.sizes = '300px';
                        }
                        
                        mediaContainer.appendChild(img);
                    } else {
                        const video = document.createElement('video');
                        video.src = item.src;
                        video.loading = index < 3 ? 'eager' : 'lazy';
                        Object.assign(video, { 
                            playsinline: true, 
                            autoplay: true, 
                            muted: true, 
                            loop: true,
                            width: 300,
                            height: 300
                        });
                        mediaContainer.appendChild(video);
                    }
                });

                if (!actionsWrapper.contains(mediaContainer)) {
                    actionsWrapper.innerHTML = '';
                    actionsWrapper.appendChild(mediaContainer);
                }
            }

            if (pollAttempts >= MAX_POLL_ATTEMPTS) {
                clearInterval(mediaPoller);
                if (!carouselBuilt) {
                    actionsWrapper.innerHTML = ''; // Clear if nothing ever found
                }
            }
        }, 1000);
    };

    const widgetPoller = setInterval(() => {
        const widget = document.querySelector('.jdgm-rev-widg');
        if (widget && widget.offsetParent !== null) {
            // Wait an extra moment for Judge.me's own JS to finish arranging things
            setTimeout(() => {
                enhanceLayout();
                restructureReviewCards(); // Restructure individual cards
            }, 200); 
            clearInterval(widgetPoller);
        }
        
        widgetAttempts++;
        if (widgetAttempts > MAX_WIDGET_ATTEMPTS) {
            clearInterval(widgetPoller);
            console.log('Could not find visible Judge.me widget to enhance.');
        }
    }, 500);

const restructureReviewCards = () => {
    // Find reviews that haven't been restructured yet
    const reviews = document.querySelectorAll('.jdgm-rev:not(.js-card-enhanced)');
    if (reviews.length === 0) return;

    console.log(`🚀 Found ${reviews.length} new review cards to restructure.`);

    reviews.forEach(review => {
        // Find the main components
        const picContainer = review.querySelector('.jdgm-rev__pics');
        const header = review.querySelector('.jdgm-rev__header');
        const content = review.querySelector('.jdgm-rev__content'); // This contains the body

        // Detect if mobile
        const isMobile = window.matchMedia('(max-width: 768px)').matches;

        if (isMobile) {
            // MOBILE LAYOUT: Image + Rating/Author in top row, Content below
            
            // Upgrade image quality in picContainer
            if (picContainer) {
                const img = picContainer.querySelector('.jdgm-rev__pic-img');
                if (img && img.src) {
                    let highQualitySrc = img.src;
                    
                    // Upgrade to higher resolution
                    highQualitySrc = highQualitySrc
                        .replace(/_(pico|icon|thumb|small|compact|medium)\./g, '_large.')
                        .replace(/_(100x100|150x150|200x200|240x240)\./g, '_480x480.')
                        .replace(/\?.*$/, '');
                    
                    if (highQualitySrc.includes('cdn.shopify.com')) {
                        // Use width parameter for better quality
                        img.src = `${highQualitySrc}?width=360&quality=100`;
                        img.srcset = `
                            ${highQualitySrc}?width=120&quality=100 120w,
                            ${highQualitySrc}?width=240&quality=100 240w,
                            ${highQualitySrc}?width=360&quality=100 360w
                        `;
                        img.sizes = '120px';
                    } else {
                        img.src = highQualitySrc;
                    }
                    
                    img.decoding = 'async';
                    img.loading = 'lazy';
                }
            }
            
            // Create top row container
            const topRow = document.createElement('div');
            topRow.className = 'jdgm-rev-card__top-row';

            // Create right column for rating/author (next to image)
            const rightColumn = document.createElement('div');
            rightColumn.className = 'jdgm-custom-right-column-content';

            // Build rating row
            if (header) {
                const ratingRow = document.createElement('div');
                ratingRow.className = 'jdgm-custom-rating-row';
                
                const rating = header.querySelector('.jdgm-rev__rating');
                const timestamp = header.querySelector('.jdgm-rev__timestamp');
                if (rating) ratingRow.appendChild(rating);
                if (timestamp) ratingRow.appendChild(timestamp);
                rightColumn.appendChild(ratingRow);

                const authorWrapper = header.querySelector('.jdgm-rev__author-wrapper');
                if (authorWrapper) rightColumn.appendChild(authorWrapper);
            }

            // Assemble top row: image + right column
            if (picContainer) {
                topRow.appendChild(picContainer);
            }
            topRow.appendChild(rightColumn);

            // Clear review and rebuild structure
            review.innerHTML = '';
            review.appendChild(topRow);
            
            // Add content below top row
            if (content) {
                review.appendChild(content);
            }
        } else {
            // DESKTOP LAYOUT: Original structure
            
            // Upgrade image quality in picContainer
            if (picContainer) {
                const img = picContainer.querySelector('.jdgm-rev__pic-img');
                if (img && img.src) {
                    let highQualitySrc = img.src;
                    
                    // Upgrade to higher resolution
                    highQualitySrc = highQualitySrc
                        .replace(/_(pico|icon|thumb|small|compact|medium)\./g, '_large.')
                        .replace(/_(100x100|150x150|200x200|240x240|280x280)\./g, '_800x800.')
                        .replace(/\?.*$/, '');
                    
                    if (highQualitySrc.includes('cdn.shopify.com')) {
                        // Use width parameter for better quality
                        img.src = `${highQualitySrc}?width=560&quality=100`;
                        img.srcset = `
                            ${highQualitySrc}?width=280&quality=100 280w,
                            ${highQualitySrc}?width=560&quality=100 560w,
                            ${highQualitySrc}?width=840&quality=100 840w
                        `;
                        img.sizes = '280px';
                    } else {
                        img.src = highQualitySrc;
                    }
                    
                    img.decoding = 'async';
                    img.loading = 'lazy';
                }
            }
            
            const rightColumn = document.createElement('div');
            rightColumn.className = 'jdgm-custom-right-column-content';

            // Re-assemble the text content into the new right column in the correct order
            if (header) {
                const ratingRow = document.createElement('div');
                ratingRow.className = 'jdgm-custom-rating-row';
                
                const rating = header.querySelector('.jdgm-rev__rating');
                const timestamp = header.querySelector('.jdgm-rev__timestamp');
                if (rating) ratingRow.appendChild(rating);
                if (timestamp) ratingRow.appendChild(timestamp);
                rightColumn.appendChild(ratingRow);

                const authorWrapper = header.querySelector('.jdgm-rev__author-wrapper');
                if (authorWrapper) rightColumn.appendChild(authorWrapper);
            }

            // IMPORTANT: Append the body content to the right column
            if (content) {
                rightColumn.appendChild(content);
            }

            // Clean up the original header which is now empty
            if (header) {
                header.remove();
            }

            // Prepend the picture container (left column) and append the new right column
            if (picContainer) {
                review.prepend(picContainer);
            }
            review.appendChild(rightColumn);
        }

        review.classList.add('js-card-enhanced');
    });
};

// Run restructuring on an interval to catch lazily-loaded reviews.
setInterval(restructureReviewCards, 1000);

// Re-structure on window resize to handle mobile/desktop switch
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Remove enhanced flags to allow re-structuring
        document.querySelectorAll('.jdgm-rev.js-card-enhanced').forEach(review => {
            review.classList.remove('js-card-enhanced');
        });
        restructureReviewCards();
    }, 300);
});

});
