import westView from '../../../public/נוף צד מערב.JPG'
import southView from '../../../public/נוף צד דרום.JPG'
import northBalcony from '../../../public/מרפסת לכיוון צפון.JPG'
import southBalcony from '../../../public/מרפסת לכיוון דרום.JPG'
import bedroom from '../../../public/חדר שינה.JPG'
import './HomePage.css'

const photos = [
  { src: westView, alt: 'נוף פתוח לכיוון מערב', title: 'נוף מערבי', area: 'west' },
  { src: southView, alt: 'נוף פתוח לכיוון דרום', title: 'נוף דרומי', area: 'south' },
  { src: northBalcony, alt: 'המרפסת הפונה צפונה', title: 'מרפסת צפונית', area: 'north-balcony' },
  { src: southBalcony, alt: 'המרפסת הפונה דרומה', title: 'מרפסת דרומית', area: 'south-balcony' },
  { src: bedroom, alt: 'חדר השינה בפונדק', title: 'חדר השינה', area: 'bedroom' }
]

const HomePage = () => {
  return (
    <section className="home-page" aria-labelledby="home-title">
      <header className="home-intro">
        <p className="home-eyebrow">אירוח באווירה ביתית</p>
        <h1 id="home-title" aria-label="הפונדק שלנו :)">
          <span>הפונדק שלנו</span>
          <span dir="ltr">:)</span>
        </h1>
        <p className="home-description">מקום לנשום, להירגע וליהנות מהנוף.</p>
      </header>

      <section className="home-collage" aria-label="תמונות הפונדק">
        {photos.map((photo) => (
          <figure key={photo.area} className={`home-collage-item home-collage-${photo.area}`}>
            <img src={photo.src} alt={photo.alt} />
            <figcaption>{photo.title}</figcaption>
          </figure>
        ))}
      </section>
    </section>
  )
}

export default HomePage