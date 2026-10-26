import React, { useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import SingleProduct from './SingleProduct'
import ChangeAmount from './ChangeAmount'
import './ShowStock.css'

const ShowStock = () => {
    const [info, setInfo] = useState([])
    const [search, setSearch] = useState('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [selectedProduct, setSelectedProduct] = useState(null)

    const getData = async () => {
        setLoading(true)
        setError('')
        try {
            const { data } = await axios.get('http://127.0.0.1:7200/api/amount')
            setInfo(data)
        } catch (requestError) {
            console.error('Failed to load stock products:', requestError)
            setError('לא הצלחנו לטעון את המלאי. כדאי לבדוק שהשרת פעיל ולנסות שוב.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        getData()
    }, [])

    const filteredProducts = useMemo(() => {
        const query = search.trim().toLocaleLowerCase('he')
        return info.filter((product) => product.product?.toLocaleLowerCase('he').includes(query))
    }, [info, search])

    const updateProduct = (updatedProduct) => {
        setInfo((currentInfo) => currentInfo.map((product) => (
            product._id === updatedProduct._id ? updatedProduct : product
        )))
        setSelectedProduct(null)
    }

    return (
        <section className="stock-page page-container">
            <header className="stock-heading page-header">
                <div>
                    <p className="eyebrow">ניהול ומעקב</p>
                    <h1>המלאי שלנו</h1>
                </div>
            </header>

            <label className="stock-search stock-search-top">
                <i className="pi pi-search" aria-hidden="true" />
                <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="חיפוש מוצר"
                    aria-label="חיפוש מוצר במלאי"
                />
            </label>

            <section className="stock-products-panel">
                <div className="stock-panel-heading">
                    <div>
                        <h2>רשימת מוצרים</h2>
                        <p>מעקב אחר הכמות הזמינה מכל מוצר</p>
                    </div>
                </div>

                {error && (
                    <div className="stock-feedback stock-error" role="alert">
                        <i className="pi pi-exclamation-circle" aria-hidden="true" />
                        <span>{error}</span>
                        <button type="button" onClick={getData}>נסו שוב</button>
                    </div>
                )}
                {loading && <div className="stock-feedback"><i className="pi pi-spin pi-spinner" aria-hidden="true" /> טוענים את המלאי...</div>}
                {!loading && !error && filteredProducts.length === 0 && (
                    <div className="stock-empty-state">
                        <i className="pi pi-inbox" aria-hidden="true" />
                        <strong>{search ? 'לא נמצאו מוצרים מתאימים' : 'עדיין אין מוצרים במלאי'}</strong>
                        <span>{search ? 'אפשר לנסות חיפוש אחר.' : 'מוצרים יופיעו כאן לאחר הוספתם למלאי.'}</span>
                    </div>
                )}
                {!loading && !error && filteredProducts.length > 0 && (
                    <div className="stock-products-grid">
                        {filteredProducts.map((product) => (
                            <SingleProduct key={product._id} product={product} onSelect={setSelectedProduct} />
                        ))}
                    </div>
                )}
            </section>
            {selectedProduct && (
                <ChangeAmount
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onSave={updateProduct}
                />
            )}
        </section>
    )
}

export default ShowStock
