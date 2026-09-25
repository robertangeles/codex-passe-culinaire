/**
 * Include this script in the public document head before page styles can paint.
 * It mutates the root data-theme attribute, so suppressHydrationWarning belongs
 * on the parent layout's html element.
 */
export const themeInitScript = '(()=>{try{const preference=localStorage.getItem("passe-theme");const root=document.documentElement;if(preference==="light"||preference==="dark")root.dataset.theme=preference;else if(preference==="system")delete root.dataset.theme}catch{}})()';
