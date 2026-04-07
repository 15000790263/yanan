export default {
  beforeRouteEnter(to, from, next) {
    next(vm => {
      if (from.query.formType === 'show') {
        vm.$router.push(
          `/inspect/checking/${vm.$route.query.id}?type=${from.query.type}&formType=edit&fromHistory=1`
        );
      } else {
        vm.$router.goBack();
      }
    });
  },
};
