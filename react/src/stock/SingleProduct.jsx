import React from 'react'

const SingleProduct = ({ product, onSelect }) => {
    const quantity = Number(product.proAmount || 0)

    return (
        <button className="stock-product-card" type="button" onDoubleClick={() => onSelect(product)} aria-haspopup="dialog">
            <span className="stock-product-icon"><i className="pi pi-box" aria-hidden="true" /></span>
            <div className="stock-product-details">
                <h3>{product.product}</h3>
                <span>כמות זמינה</span>
            </div>
            <strong className={`stock-product-quantity ${quantity === 0 ? 'is-empty' : ''}`}>
                {quantity}
                <small>יח׳</small>
            </strong>
        </button>
    )
}

export default SingleProduct