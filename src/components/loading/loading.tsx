import * as React from 'react'
import './loading.scss'

export const Loading: React.FunctionComponent<{}> = () => {
    return <div className="lds-roller">
        <div/>
        <div/>
        <div/>
        <div/>
        <div/>
        <div/>
        <div/>
        <div/>
    </div>
}