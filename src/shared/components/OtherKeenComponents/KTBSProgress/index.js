import React from 'react';
import PropTypes, { number } from 'prop-types';

KTBSProgress.propTypes = {
    valueMin: PropTypes.number,
    valueMax: PropTypes.number,
    valueNow: PropTypes.number,
    showLabel: PropTypes.bool,
    heightInPixel: number,
    progressBarAdditionalClassName: PropTypes.string,
    multipleBar: PropTypes.bool,
    multipleBarItems: PropTypes.arrayOf(PropTypes.shape({
        valueMin: PropTypes.number,
        valueMax: PropTypes.number,
        valueNow: PropTypes.number,
        showLabel: PropTypes.bool,
        className: PropTypes.string,
    })),
    striped: PropTypes.bool,
    stripedAnimate: PropTypes.bool,
};

KTBSProgress.defaultProps = {
    valueMin: 0,
    valueMax: 100,
    valueNow: 0,
    showLabel: false,
    heightInPixel: 0,
    progressBarAdditionalClassName: '',
    multipleBar: false,
    multipleBarItems: [],
    striped: false,
    stripedAnimate: false,
};

/**
 * 
 * @param {{
 * valueMin: number,
 * valueMax: number,
 * valueNow: number,
 * showLabel: boolean,
 * heightInPixel: number,
 * progressBarAdditionalClassName: string,
 * multipleBar: boolean,
 * multipleBarItems: {valueMin: number, valueMax: number, valueNow: number, showLabel: boolean, progressBarAdditionalClassName: string, striped: boolean, stripedAnimate: boolean}[],
 * striped: boolean,
 * stripedAnimate: boolean,
 * }} props 
 * @returns 
 */
function KTBSProgress(props) {
    // MARK: --- Params ---
    const {
        valueMax,
        valueMin,
        valueNow,
        showLabel,
        heightInPixel,
        progressBarAdditionalClassName,
        multipleBar,
        multipleBarItems,
        striped,
        stripedAnimate
    } = props;

    return (
        <div>
            <div className='progress' style={{
                height: heightInPixel > 0 ? `${heightInPixel}px` : ''
            }}>
                {
                    !multipleBar ? (
                        <div
                            className={`
                                progress-bar 
                                ${progressBarAdditionalClassName}
                                ${striped ? 'progress-bar-striped' : ''}
                                ${stripedAnimate ? 'progress-bar-animated' : ''}
                            `}
                            aria-valuemin={valueMin}
                            aria-valuemax={valueMax}
                            aria-valuenow={valueNow}
                            style={{
                                width: `${valueNow}%`
                            }}
                        >
                            {
                                showLabel && (
                                    `${valueNow}%`
                                )
                            }
                        </div>
                    ) : (
                        multipleBarItems.map((item, index) => {
                            return (
                                <div
                                    className={`
                                        progress-bar 
                                        ${item.progressBarAdditionalClassName}
                                        ${item.striped ? 'progress-bar-striped' : ''}
                                        ${item.stripedAnimate ? 'progress-bar-animated' : ''}
                                    `}
                                    aria-valuemin={item.valueMin}
                                    aria-valuemax={item.valueMax}
                                    aria-valuenow={item.valueNow}
                                    style={{
                                        width: `${item.valueNow}%`
                                    }}
                                >
                                    {
                                        item.showLabel && (
                                            `${item.valueNow}%`
                                        )
                                    }
                                </div>
                            )
                        })
                    )
                }
            </div>
        </div>
    );
}

export default KTBSProgress;