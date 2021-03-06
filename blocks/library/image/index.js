/**
 * WordPress dependencies
 */
import { __ } from 'i18n';
import { Placeholder, Dashicon, Toolbar } from 'components';

/**
 * Internal dependencies
 */
import './style.scss';
import { registerBlockType, query } from '../../api';
import Editable from '../../editable';
import MediaUploadButton from '../../media-upload-button';
import InspectorControls from '../../inspector-controls';
import TextControl from '../../inspector-controls/text-control';
import BlockControls from '../../block-controls';
import BlockAlignmentToolbar from '../../block-alignment-toolbar';
import BlockDescription from '../../block-description';
import UrlInput from '../../url-input';

const { attr, children } = query;

registerBlockType( 'core/image', {
	title: __( 'Image' ),

	icon: 'format-image',

	category: 'common',

	attributes: {
		url: attr( 'img', 'src' ),
		alt: attr( 'img', 'alt' ),
		caption: children( 'figcaption' ),
		href: attr( 'a', 'href' ),
	},

	transforms: {
		from: [
			{
				type: 'raw',
				matcher: ( node ) => (
					node.nodeName === 'IMG' ||
					( ! node.textContent && node.querySelector( 'img' ) )
				),
				attributes: {
					url: attr( 'img', 'src' ),
					alt: attr( 'img', 'alt' ),
					caption: children( 'figcaption' ),
				},
			},
		],
	},

	getEditWrapperProps( attributes ) {
		const { align } = attributes;
		if ( 'left' === align || 'right' === align || 'wide' === align || 'full' === align ) {
			return { 'data-align': align };
		}
	},

	edit( { attributes, setAttributes, focus, setFocus, className } ) {
		const { url, alt, caption, align, id, href } = attributes;
		const updateAlt = ( newAlt ) => setAttributes( { alt: newAlt } );
		const updateAlignment = ( nextAlign ) => setAttributes( { align: nextAlign } );
		const onSelectImage = ( media ) => {
			setAttributes( { url: media.url, alt: media.alt, caption: media.caption, id: media.id } );
		};
		const uploadButtonProps = { isLarge: true };
		const onSetHref = ( event ) => setAttributes( { href: event.target.value } );

		const controls = (
			focus && (
				<BlockControls key="controls">
					<BlockAlignmentToolbar
						value={ align }
						onChange={ updateAlignment }
						controls={ [ 'left', 'center', 'right', 'wide', 'full' ] }
					/>

					<Toolbar>
						<li>
							<MediaUploadButton
								buttonProps={ {
									className: 'components-icon-button components-toolbar__control',
									'aria-label': __( 'Edit image' ),
								} }
								onSelect={ onSelectImage }
								type="image"
								value={ id }
							>
								<Dashicon icon="edit" />
							</MediaUploadButton>
						</li>
						<UrlInput onChange={ onSetHref } url={ href } />
					</Toolbar>
				</BlockControls>
			)
		);

		if ( ! url ) {
			return [
				controls,
				<Placeholder
					key="placeholder"
					instructions={ __( 'Drag image here or insert from media library' ) }
					icon="format-image"
					label={ __( 'Image' ) }
					className={ className }>
					<MediaUploadButton
						buttonProps={ uploadButtonProps }
						onSelect={ onSelectImage }
						type="image"
					>
						{ __( 'Insert from Media Library' ) }
					</MediaUploadButton>
				</Placeholder>,
			];
		}

		const focusCaption = ( focusValue ) => setFocus( { editable: 'caption', ...focusValue } );

		// Disable reason: Each block can be selected by clicking on it

		/* eslint-disable jsx-a11y/no-static-element-interactions, jsx-a11y/onclick-has-role, jsx-a11y/click-events-have-key-events */
		return [
			controls,
			focus && (
				<InspectorControls key="inspector">
					<BlockDescription>
						<p>{ __( 'Worth a thousand words.' ) }</p>
					</BlockDescription>
					<h3>{ __( 'Image Settings' ) }</h3>
					<TextControl label={ __( 'Alternate Text' ) } value={ alt } onChange={ updateAlt } />
				</InspectorControls>
			),
			<figure key="image" className={ className }>
				<img src={ url } alt={ alt } onClick={ setFocus } />
				{ ( caption && caption.length > 0 ) || !! focus ? (
					<Editable
						tagName="figcaption"
						placeholder={ __( 'Write caption…' ) }
						value={ caption }
						focus={ focus && focus.editable === 'caption' ? focus : undefined }
						onFocus={ focusCaption }
						onChange={ ( value ) => setAttributes( { caption: value } ) }
						inlineToolbar
					/>
				) : null }
			</figure>,
		];
		/* eslint-enable jsx-a11y/no-static-element-interactions, jsx-a11y/onclick-has-role, jsx-a11y/click-events-have-key-events */
	},

	save( { attributes } ) {
		const { url, alt, caption = [], align, href } = attributes;
		const image = <img src={ url } alt={ alt } />;

		return (
			<figure className={ align && `align${ align }` }>
				{ href ? <a href={ href }>{ image }</a> : image }
				{ caption.length > 0 && <figcaption>{ caption }</figcaption> }
			</figure>
		);
	},
} );
