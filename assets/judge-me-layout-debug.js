/* 
  Judge.me Layout Debugger v7
  - Focuses on the structure of individual review cards to prepare for a major refactor.
*/
document.addEventListener('DOMContentLoaded', function() {
    console.log('%c🚀 Review Card Debugger Activated', 'color: #fff; background: #007bff; padding: 5px; border-radius: 3px;');

    let attempts = 0;
    const maxAttempts = 20;

    const findReviews = setInterval(() => {
        attempts++;
        const reviews = document.querySelectorAll('.jdgm-rev');

        if (reviews.length > 0) {
            clearInterval(findReviews);
            console.log(`%c✅ Found ${reviews.length} review cards. Analyzing the structure of the first one...`, 'color: #28a745; font-weight: bold;');
            debugReviewCard(reviews[0]);
        } else if (attempts >= maxAttempts) {
            clearInterval(findReviews);
            console.error('❌ No review cards (.jdgm-rev) found after 10 seconds.');
        }
    }, 500);
});

function debugReviewCard(review) {
    console.group('📊 Review Card Structure Analysis');
    console.log('Outer HTML of Card:', review.outerHTML);

    const elementsToDebug = {
        'Card Root (.jdgm-rev)': review,
        'Picture Container (.jdgm-rev__rev-pic)': review.querySelector('.jdgm-rev__rev-pic'),
        'Header (contains rating/timestamp) (.jdgm-rev__header)': review.querySelector('.jdgm-rev__header'),
        'Profile Row (contains author) (.jdgm-row-profile)': review.querySelector('.jdgm-row-profile'),
        'Content (contains body text) (.jdgm-rev__content)': review.querySelector('.jdgm-rev__content'),
    };

    for (const [label, el] of Object.entries(elementsToDebug)) {
        if (el) {
            console.groupCollapsed(`🔍 ${label}`);
            console.log('Element:', el);
            logComputedStyles(el);
            console.groupEnd();
        } else {
            console.warn(`Could not find element: ${label}`);
        }
    }

    console.groupEnd();
}

function logComputedStyles(element) {
    const styles = window.getComputedStyle(element);
    console.log('Computed Styles:', {
        'display': styles.display,
        'flex-direction': styles.flexDirection,
        'order': styles.order,
        'width': styles.width,
        'margin': styles.margin,
        'padding': styles.padding
    });
}
