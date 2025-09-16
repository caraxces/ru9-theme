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
                // Find images
                review.querySelectorAll('.jdgm-rev__pic-img').forEach(img => {
                    if (img.src && !uniqueSources.has(img.src)) {
                        uniqueSources.add(img.src);
                        newlyFoundMedia.push({ type: 'image', src: img.src });
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

                newlyFoundMedia.forEach(item => {
                    const el = (item.type === 'image') ? document.createElement('img') : document.createElement('video');
                    el.src = item.src;
                    el.loading = 'lazy';
                    if (item.type === 'video') {
                        Object.assign(el, { playsinline: true, autoplay: true, muted: true, loop: true });
                    }
                    mediaContainer.appendChild(el);
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
        // Find the main components that haven't been moved yet
        const picContainer = review.querySelector('.jdgm-rev__pics');
        const header = review.querySelector('.jdgm-rev__header');
        const content = review.querySelector('.jdgm-rev__content'); // This contains the body

        // --- Create the new structure ---

        // 1. Create the top row that will hold the image and author info
        const topRow = document.createElement('div');
        topRow.className = 'jdgm-rev-card__top-row';

        // 2. Create the right column for author info
        const rightColumn = document.createElement('div');
        rightColumn.className = 'jdgm-custom-right-column-content';

        // 3. Extract rating, timestamp, and author from the original header
        if (header) {
            const ratingRow = document.createElement('div');
            ratingRow.className = 'jdgm-custom-rating-row';
            
            const rating = header.querySelector('.jdgm-rev__rating');
            const timestamp = header.querySelector('.jdgm-rev__timestamp');
            const authorWrapper = header.querySelector('.jdgm-rev__author-wrapper');

            if (rating) ratingRow.appendChild(rating);
            if (timestamp) ratingRow.appendChild(timestamp);
            
            rightColumn.appendChild(ratingRow);
            if (authorWrapper) rightColumn.appendChild(authorWrapper);

            header.remove(); // Clean up the original header
        }

        // 4. Assemble the top row
        if (picContainer) topRow.appendChild(picContainer);
        topRow.appendChild(rightColumn);

        // 5. Append the new top row and the original content (body) to the main review card
        review.appendChild(topRow);
        if (content) review.appendChild(content);

        review.classList.add('js-card-enhanced');
    });
};

// Run restructuring on an interval to catch lazily-loaded reviews.
setInterval(restructureReviewCards, 1000);

});
