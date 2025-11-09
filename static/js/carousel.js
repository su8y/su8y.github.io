function createCarousel(id, images) {
    const elementId = `carousel-${id}`;

    const innerList = [];
    const indicatorList = [];
    let i = 0;

    images.forEach(img => {

        indicatorList.push(`
        <button type="button" data-bs-target="#carouselExampleIndicators" data-bs-slide-to="${i}" class="${i === 0 ? 'active' : ''}" aria-current="true" aria-label="Slide ${i}"></button>
        `);

        innerList.push(`
        <div class="carousel-item active">
            <img alt="${id}-${i}" src="${img}"/>
        </div>
        `);
        i++;
    })

    return ` 
    <div id="${elementId}" class="carousel slide">
        <div class="carousel-indicators">
            ${indicatorList.join("")}
        </div>
        <div class="carousel-inner">
            ${innerList.join("")}
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#${elementId}" data-bs-slide="prev">
            <span class="carousel-control-prev-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Previous</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#${elementId}" data-bs-slide="next">
            <span class="carousel-control-next-icon" aria-hidden="true"></span>
            <span class="visually-hidden">Next</span>
        </button>
    </div>`
}