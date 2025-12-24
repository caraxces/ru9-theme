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

        // --- Update Rating Value Dynamically ---
        let ratingValue = '5.0'; // Default fallback

        // Method 1: Try to find from summary-average element (may be hidden)
        const averageRatingElement = summary.querySelector('.jdgm-rev-widg__summary-average') ||
            widgetHeader.querySelector('.jdgm-rev-widg__summary-average') ||
            document.querySelector('.jdgm-rev-widg__summary-average');

        if (averageRatingElement) {
            // Try text content
            const ratingText = averageRatingElement.textContent.trim();
            const ratingMatch = ratingText.match(/(\d+\.?\d*)/);
            if (ratingMatch) {
                ratingValue = parseFloat(ratingMatch[1]).toFixed(1);
            }
            // Try data attribute
            else if (averageRatingElement.dataset.averageRating) {
                ratingValue = parseFloat(averageRatingElement.dataset.averageRating).toFixed(1);
            }
            // Try any data attribute
            else {
                const dataAttrs = Array.from(averageRatingElement.attributes).filter(attr =>
                    attr.name.startsWith('data-') && !isNaN(parseFloat(attr.value))
                );
                if (dataAttrs.length > 0) {
                    ratingValue = parseFloat(dataAttrs[0].value).toFixed(1);
                }
            }
        }

        // Method 2: Try to get from widget data attributes
        if (ratingValue === '5.0') {
            const widget = widgetHeader.closest('.jdgm-widget') || widgetHeader.closest('.jdgm-rev-widg');
            if (widget) {
                // Check all data attributes
                Array.from(widget.attributes).forEach(attr => {
                    if (attr.name.includes('rating') || attr.name.includes('average')) {
                        const val = parseFloat(attr.value);
                        if (!isNaN(val) && val >= 0 && val <= 5) {
                            ratingValue = val.toFixed(1);
                        }
                    }
                });
            }
        }

        // Method 3: Try to extract from summary text content (parse stars or numbers)
        if (ratingValue === '5.0') {
            const summaryText = summary.textContent || '';
            // Look for patterns like "4.5", "4.8 out of 5", "5 stars", etc.
            const patterns = [
                /(\d+\.?\d*)\s*(?:out of|stars?|rating)/i,
                /(?:average|rating|score)[\s:]*(\d+\.?\d*)/i,
                /(\d+\.?\d*)(?:\s*\/\s*5)?/
            ];

            for (const pattern of patterns) {
                const match = summaryText.match(pattern);
                if (match) {
                    const val = parseFloat(match[1]);
                    if (!isNaN(val) && val >= 0 && val <= 5) {
                        ratingValue = val.toFixed(1);
                        break;
                    }
                }
            }
        }

        // Method 4: Try to get from Judge.me global data (if available)
        if (ratingValue === '5.0' && typeof window.JD !== 'undefined' && window.JD.reviews) {
            try {
                const productId = widgetHeader.closest('[data-product-id]')?.dataset.productId;
                if (productId && window.JD.reviews[productId]) {
                    const avgRating = window.JD.reviews[productId].average_rating;
                    if (avgRating) {
                        ratingValue = parseFloat(avgRating).toFixed(1);
                    }
                }
            } catch (e) {
                console.warn('Could not access Judge.me global data:', e);
            }
        }

        // Set the rating value as data attribute for CSS
        summary.setAttribute('data-rating', ratingValue);
        console.log('✅ Rating value updated:', ratingValue);

        // Poll for rating value update (in case Judge.me loads it later)
        let ratingPollAttempts = 0;
        const MAX_RATING_POLLS = 10;
        const ratingPoller = setInterval(() => {
            ratingPollAttempts++;

            // Try Method 1 again (element might appear later)
            const avgEl = summary.querySelector('.jdgm-rev-widg__summary-average') ||
                widgetHeader.querySelector('.jdgm-rev-widg__summary-average');

            if (avgEl) {
                const text = avgEl.textContent.trim();
                const match = text.match(/(\d+\.?\d*)/);
                if (match) {
                    const newRating = parseFloat(match[1]).toFixed(1);
                    const currentRating = summary.getAttribute('data-rating') || '5.0';
                    if (newRating !== currentRating) {
                        summary.setAttribute('data-rating', newRating);
                        console.log('✅ Rating value updated (delayed):', newRating);
                    }
                }
            }

            // Stop polling after max attempts
            if (ratingPollAttempts >= MAX_RATING_POLLS) {
                clearInterval(ratingPoller);
            }
        }, 500);

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

        // Performance: Use requestAnimationFrame for smoother polling
        let lastPollTime = 0;
        const POLL_INTERVAL = 1000; // 1 second
        
        const mediaPoller = () => {
            const now = performance.now();
            if (now - lastPollTime < POLL_INTERVAL) {
                requestAnimationFrame(mediaPoller);
                return;
            }
            lastPollTime = now;
            
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

                        // Set explicit dimensions - Match Figma: 345x317px desktop
                        const isMobile = window.matchMedia('(max-width: 768px)').matches;
                        if (isMobile) {
                            img.width = 120; // Match Figma mobile
                            img.height = 120;
                            img.sizes = '120px';
                        } else {
                            img.width = 345; // Match Figma desktop
                            img.height = 317;
                            img.sizes = '345px';
                        }

                        // Add srcset for responsive images (if Shopify CDN)
                        if (item.src.includes('cdn.shopify.com')) {
                            const baseUrl = item.src.split('?')[0];
                            if (isMobile) {
                                img.srcset = `
                                    ${baseUrl}?width=120&quality=85 120w,
                                    ${baseUrl}?width=240&quality=85 240w
                                `;
                            } else {
                                img.srcset = `
                                    ${baseUrl}?width=345&quality=90 345w,
                                    ${baseUrl}?width=690&quality=90 690w
                                `;
                            }
                        }

                        mediaContainer.appendChild(img);
                    } else {
                        const video = document.createElement('video');
                        video.src = item.src;
                        video.loading = index < 3 ? 'eager' : 'lazy';
                        const isMobile = window.matchMedia('(max-width: 768px)').matches;
                        Object.assign(video, {
                            playsinline: true,
                            autoplay: true,
                            muted: true,
                            loop: true,
                            width: isMobile ? 120 : 345, // Match Figma dimensions
                            height: isMobile ? 120 : 317,
                            loading: 'lazy' // Lazy load videos
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
                if (!carouselBuilt) {
                    actionsWrapper.innerHTML = ''; // Clear if nothing ever found
                }
                return; // Stop polling
            }
            
            requestAnimationFrame(mediaPoller);
        };
        
        // Start polling
        requestAnimationFrame(mediaPoller);
    };

    // Performance: Use requestIdleCallback if available, fallback to setTimeout
    const scheduleCheck = (callback) => {
        if ('requestIdleCallback' in window) {
            requestIdleCallback(callback, { timeout: 500 });
        } else {
            setTimeout(callback, 500);
        }
    };
    
    const checkForWidget = () => {
        const widget = document.querySelector('.jdgm-rev-widg');
        if (widget && widget.offsetParent !== null) {
            // Wait an extra moment for Judge.me's own JS to finish arranging things
            setTimeout(() => {
                enhanceLayout();
                restructureReviewCards(); // Restructure individual cards
            }, 200);
            return; // Stop checking
        }

        widgetAttempts++;
        if (widgetAttempts <= MAX_WIDGET_ATTEMPTS) {
            scheduleCheck(checkForWidget);
        } else {
            console.log('Could not find visible Judge.me widget to enhance.');
        }
    };
    
    // Start checking for widget
    scheduleCheck(checkForWidget);

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

            // Debug: Log if author is missing
            if (isMobile && !review.querySelector('.jdgm-rev__author')) {
                console.warn('⚠️ Review missing author:', review);
            }

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
                            // Use width parameter - optimized quality for mobile (85% is good balance)
                            img.src = `${highQualitySrc}?width=240&quality=85`; // Lower quality for mobile performance
                            img.srcset = `
                            ${highQualitySrc}?width=120&quality=85 120w,
                            ${highQualitySrc}?width=240&quality=85 240w,
                            ${highQualitySrc}?width=360&quality=85 360w
                        `;
                            img.sizes = '120px';
                        } else {
                            img.src = highQualitySrc;
                        }

                        img.decoding = 'async';
                        img.loading = 'lazy';
                        // Performance: reduce image rendering complexity
                        img.style.willChange = 'auto';
                    }
                }

                // IMPORTANT: Extract elements BEFORE clearing innerHTML to preserve them
                // Try to find rating in header first, then anywhere in review
                let rating = header ? header.querySelector('.jdgm-rev__rating') : null;
                if (!rating) {
                    rating = review.querySelector('.jdgm-rev__rating');
                }

                // Try to find timestamp in header first, then anywhere in review
                let timestamp = header ? header.querySelector('.jdgm-rev__timestamp') : null;
                if (!timestamp) {
                    timestamp = review.querySelector('.jdgm-rev__timestamp');
                }

                // Try to find authorWrapper in header first, then anywhere in review
                let authorWrapper = header ? header.querySelector('.jdgm-rev__author-wrapper') : null;
                if (!authorWrapper) {
                    authorWrapper = review.querySelector('.jdgm-rev__author-wrapper');
                }

                // Fallback: try to find author anywhere in the review if wrapper doesn't exist
                if (!authorWrapper) {
                    const author = review.querySelector('.jdgm-rev__author');
                    if (author) {
                        // Create wrapper if author exists but wrapper doesn't
                        authorWrapper = document.createElement('div');
                        authorWrapper.className = 'jdgm-rev__author-wrapper';
                        authorWrapper.appendChild(author);
                    }
                }

                // Create top row container
                const topRow = document.createElement('div');
                topRow.className = 'jdgm-rev-card__top-row';

                // Create right column for rating/author (next to image)
                const rightColumn = document.createElement('div');
                rightColumn.className = 'jdgm-custom-right-column-content';

                // Build rating row - always create it if rating or timestamp exists
                if (rating || timestamp) {
                    const ratingRow = document.createElement('div');
                    ratingRow.className = 'jdgm-custom-rating-row';

                    if (rating) {
                        ratingRow.appendChild(rating);
                    }
                    if (timestamp) {
                        ratingRow.appendChild(timestamp);
                    }
                    rightColumn.appendChild(ratingRow);
                } else {
                    // If no rating found, log warning for debugging
                    console.warn('⚠️ Review missing rating:', review);
                }

                // Add author wrapper if it exists
                if (authorWrapper) {
                    rightColumn.appendChild(authorWrapper);
                }

                // Assemble top row: image + right column
                if (picContainer) {
                    topRow.appendChild(picContainer);
                }
                topRow.appendChild(rightColumn);

                // Clear review and rebuild structure (elements are already moved, so safe to clear)
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
                // Try to find rating in header first, then anywhere in review
                let rating = header ? header.querySelector('.jdgm-rev__rating') : null;
                if (!rating) {
                    rating = review.querySelector('.jdgm-rev__rating');
                }

                // Try to find timestamp in header first, then anywhere in review
                let timestamp = header ? header.querySelector('.jdgm-rev__timestamp') : null;
                if (!timestamp) {
                    timestamp = review.querySelector('.jdgm-rev__timestamp');
                }

                // Try to find authorWrapper in header first, then anywhere in review
                let authorWrapper = header ? header.querySelector('.jdgm-rev__author-wrapper') : null;
                if (!authorWrapper) {
                    authorWrapper = review.querySelector('.jdgm-rev__author-wrapper');
                }

                // Fallback: create authorWrapper if author exists but wrapper doesn't
                if (!authorWrapper) {
                    const author = review.querySelector('.jdgm-rev__author');
                    if (author) {
                        authorWrapper = document.createElement('div');
                        authorWrapper.className = 'jdgm-rev__author-wrapper';
                        authorWrapper.appendChild(author);
                    }
                }

                // Build rating row if rating or timestamp exists
                if (rating || timestamp) {
                    const ratingRow = document.createElement('div');
                    ratingRow.className = 'jdgm-custom-rating-row';

                    if (rating) ratingRow.appendChild(rating);
                    if (timestamp) ratingRow.appendChild(timestamp);
                    rightColumn.appendChild(ratingRow);
                }

                // Add author wrapper if it exists
                if (authorWrapper) {
                    rightColumn.appendChild(authorWrapper);
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

    // Also use MutationObserver to catch reviews added dynamically
    const reviewsContainer = document.querySelector('.jdgm-rev-widg__reviews') ||
        document.querySelector('.jdgm-rev-widg__body') ||
        document.querySelector('.jdgm-widget');

    if (reviewsContainer) {
        const observer = new MutationObserver((mutations) => {
            let shouldRestructure = false;
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === 1 && (node.classList.contains('jdgm-rev') || node.querySelector('.jdgm-rev'))) {
                            shouldRestructure = true;
                        }
                    });
                }
            });
            if (shouldRestructure) {
                // Remove enhanced flag from new reviews to allow restructuring
                const newReviews = reviewsContainer.querySelectorAll('.jdgm-rev.js-card-enhanced');
                newReviews.forEach(review => {
                    // Only remove flag if it was just added (not already processed)
                    if (!review.querySelector('.jdgm-custom-right-column-content')) {
                        review.classList.remove('js-card-enhanced');
                    }
                });
                restructureReviewCards();
            }
        });

        observer.observe(reviewsContainer, {
            childList: true,
            subtree: true
        });
    }

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
