import KT01Content from 'shared/components/Contents/KT01Content';
import KT01Footer from 'shared/components/Footers/KT01Footer';
import KT01Header from 'shared/components/Headers/KT01Header';
import KT01HeaderMobile from 'shared/components/Headers/KT01HeaderMobile';
import KTScrollTop from 'shared/components/OtherKeenComponents/KTScrollTop';
import KT01Sidebar from 'shared/components/Sidebars/KT01Sidebar';

function KT01BaseLayout(props) {
  // MARK: --- Params ---
  return (
    <div className="d-flex flex-column min-vh-100">
      {/* Header mobile */}
      <KT01HeaderMobile />

      <div className="d-flex flex-column flex-root">
        <div className="d-flex flex-row flex-column-fluid page">
          {/* Sidebar */}
          <KT01Sidebar />

          <div id="kt_wrapper" className="d-flex flex-column flex-row-fluid wrapper">
            {/* Header */}
            <KT01Header />

            {/* Content */}
            <KT01Content>{props.children}</KT01Content>

            {/* Footer */}
            <KT01Footer />
          </div>
        </div>
      </div>

      {/* Scroll Top */}
      <KTScrollTop />
    </div>
  );
}

export default KT01BaseLayout;
