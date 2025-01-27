const { Fragment } = require("react");

function JobIcon({ industry }) {
    const className = "h-[160px]"
    const renderIcon = () => {
        switch(industry) {
            case 'Technology':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" id="technology" className={className}>
                        <rect width="12" height="8" x="10" y="53" fill="#33415c"></rect>
                        <path fill="#fec3a6" d="M21,50h0a10.142,10.142,0,0,0-3.844-8h0l-1.488-3.1a1.564,1.564,0,0,0-1.4-.9h0a1.615,1.615,0,0,0-1.538,1.952L13.313,43l1.921,4h0a16.99,16.99,0,0,1-8-11.953l-.377-2.359A1.966,1.966,0,0,0,4.942,31h0a1.994,1.994,0,0,0-1.927,2.271l.55,4.581A24.151,24.151,0,0,0,11.391,53H21Z"></path>
                        <rect width="12" height="8" x="42" y="53" fill="#33415c" transform="rotate(180 48 57)"></rect>
                        <path fill="#fec3a6" d="M43,50h0a10.142,10.142,0,0,1,3.844-8h0l1.488-3.1a1.564,1.564,0,0,1,1.4-.9h0a1.615,1.615,0,0,1,1.538,1.952L50.687,43l-1.921,4h0a16.99,16.99,0,0,0,8-11.953l.377-2.359A1.966,1.966,0,0,1,59.058,31h0a1.994,1.994,0,0,1,1.927,2.271l-.55,4.581A24.151,24.151,0,0,1,52.609,53H43Z"></path>
                        <path fill="#f9c74f" d="M44,15a12,12,0,1,0-21,7.919V27l2,4H39l2-4V22.919A11.94,11.94,0,0,0,44,15Z"></path>
                        <path fill="#33415c" d="M26,31H38a0,0,0,0,1,0,0v6a2,2,0,0,1-2,2H28a2,2,0,0,1-2-2V31A0,0,0,0,1,26,31Z"></path>
                        <circle cx="32" cy="21" r="2" fill="#7ccdf4"></circle>
                        <circle cx="38" cy="13" r="2" fill="#7ccdf4"></circle>
                        <circle cx="26" cy="13" r="2" fill="#7ccdf4"></circle>
                    </svg>
                );
            case 'Healthcare':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" id="healthcare" className={className}>
                        <path fill="#e4222e" d="M250,31.08h0a80.49,80.49,0,0,0-113.84,0h0a80.49,80.49,0,0,0,0,113.84L241.86,250.63a20,20,0,0,0,28.28,0L375.85,144.92a80.49,80.49,0,0,0,0-113.84h0a80.49,80.49,0,0,0-113.84,0h0A8.5,8.5,0,0,1,250,31.08Z"></path>
                        <path fill="#c0232c" d="M375.85,31.08h0A80.4,80.4,0,0,0,303.93,8.91a80.07,80.07,0,0,1,41.92,22.17h0a80.49,80.49,0,0,1,0,113.84L241,249.78l.86.85a20,20,0,0,0,28.28,0L375.85,144.92A80.49,80.49,0,0,0,375.85,31.08Z"></path>
                    </svg>
                );
            case 'Finance':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" id="finance" className={className}>
                        <path d="M30.678,40.726A1,1,0,0,1,28.99,40V16a1,1,0,0,1,1-1h11V5h-10V8a1,1,0,0,1-1,1h-8a1,1,0,0,1-1-1V5h-10V51h30V36.366L35.2,36.44Z"></path>
                        <path d="M10.99,59h30V53h-30Zm11-4h8a1,1,0,1,1,0,2h-8a1,1,0,0,1,0-2Z"></path>
                        <rect height="2" width="6" x="22.99" y="5"></rect>
                    </svg>
                );
            case 'Education':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" id="education" className={className}>
                        <polygon points="331,66.36 331,106.36 181,106.36 181,66.36 224.93,66.36 255.64,35.64 286.36,66.36" style={{fill:"#FEBE76"}}></polygon>
                        <polygon points="183.5,76.193 227.43,76.193 258.141,45.474 288.86,76.193 331,76.193 331,66.36 286.36,66.36 255.64,35.64 224.93,66.36 181,66.36 181,106.36 183.5,106.36" style={{fill:"#E8A664"}}></polygon>
                    </svg>
                );
            case 'Manufacturing':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 72 72" id="manufacturing" className={className}>
                        <g id="color">
                            <rect x="9.5" y="38" width="53" height="17" fill="#EA5A47" stroke="none"/>
                            <rect x="14.5" y="43" width="13" height="12" fill="#D0CFCE" stroke="none"/>
                            <rect x="32.5" y="43" width="5" height="5" fill="#92D3F5" stroke="none"/>
                            <rect x="37.5" y="43" width="5" height="5" fill="#92D3F5" stroke="none"/>
                        </g>
                    </svg>
                );
            case 'Retail':
                return (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" id="retail" className={className}>
                        <path d="M62 15H2l6 10h48z" fill="#4d4d4d"/>
                        <path d="M56 25H8v32h48z" fill="#666"/>
                        <path d="M52 29H12v24h40z" fill="#fff"/>
                        <path d="M52 33H12v2h40zm0 4H12v2h40zm0 4H12v2h40zm0 4H12v2h40zm0 4H12v2h40z" fill="#ccc"/>
                    </svg>
                );
            default:
                return (
                    <Fragment>
                        <svg
                            className="h-[160px]"
                            width="200"
                            height="200"
                            id="Capa_1"
                            xmlns="http://www.w3.org/2000/svg"
                            xmlnsXlink="http://www.w3.org/1999/xlink"
                            x="0px"
                            y="0px"
                            viewBox="0 0 512 512"
                            style={{
                                enableBackground: "new 0 0 512 512",
                            }}
                            xmlSpace="preserve"
                        >
                            {/* Original default icon SVG path */}
                            <g>
                                <path d="M411.779,192.47c-4.166,1.472-6.35,6.043-4.877,10.208C412.939,219.763,416,237.703,416,256c0,88.225-71.776,160-160,160 S96,344.225,96,256S167.776,96,256,96c37.952,0,74.749,13.522,103.612,38.076c3.365,2.861,8.414,2.455,11.277-0.91 s2.456-8.414-0.91-11.277C338.226,94.876,297.747,80,256,80c-97.047,0-176,78.953-176,176s78.953,176,176,176s176-78.953,176-176 c0-20.118-3.369-39.852-10.012-58.652C420.516,193.182,415.946,190.997,411.779,192.47z"/>
                            </g>
                        </svg>
                    </Fragment>
                );
        }
    };

    return (
        <Fragment>
            {renderIcon()}
        </Fragment>
    );
}

export default JobIcon;